import { collection, addDoc, query, where, onSnapshot, updateDoc, doc, Timestamp, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export interface Notification {
  id?: string;
  userId: string;
  type: 'result_rejected' | 'result_verified' | 'match_assigned' | 'membership_expiry';
  title: string;
  message: string;
  matchId?: string;
  read: boolean;
  priority: 'high' | 'normal' | 'low';
  data?: {
    matchId?: string;
    rejectionReason?: string;
    requiresAction?: boolean;
  };
  createdAt: Date;
}

/**
 * Crear notificación
 */
export async function createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<string> {
  const notificationsRef = collection(db, 'notifications');
  const docRef = await addDoc(notificationsRef, {
    ...notification,
    createdAt: Timestamp.now()
  });
  return docRef.id;
}

/**
 * Notificar a ambos jugadores cuando resultado es rechazado
 */
export async function notifyResultRejected(
  player1Id: string,
  player2Id: string,
  matchId: string,
  rejectionReason: string
): Promise<void> {
  const message = `Tu resultado fue rechazado por el administrador.

Razón: ${rejectionReason}

⚠️ ACCIÓN REQUERIDA: Por favor, dirígete a Mesa Técnica para ingresar el resultado correcto.`;

  // Notificar jugador 1
  await createNotification({
    userId: player1Id,
    type: 'result_rejected',
    title: '⚠️ Resultado Rechazado - Ir a Mesa Técnica',
    message,
    matchId,
    read: false,
    priority: 'high',
    data: {
      matchId,
      rejectionReason,
      requiresAction: true
    }
  });

  // Notificar jugador 2
  await createNotification({
    userId: player2Id,
    type: 'result_rejected',
    title: '⚠️ Resultado Rechazado - Ir a Mesa Técnica',
    message,
    matchId,
    read: false,
    priority: 'high',
    data: {
      matchId,
      rejectionReason,
      requiresAction: true
    }
  });
}

/**
 * Notificar cuando resultado es verificado
 */
export async function notifyResultVerified(
  player1Id: string,
  player2Id: string,
  player1Name: string,
  player2Name: string,
  ratingChanges: any
): Promise<void> {
  // Notificar jugador 1
  await createNotification({
    userId: player1Id,
    type: 'result_verified',
    title: '✓ Resultado Verificado',
    message: `Tu resultado contra ${player2Name} fue verificado.

Rating: ${ratingChanges.player1.change > 0 ? '+' : ''}${ratingChanges.player1.change} pts (${ratingChanges.player1.oldRating} → ${ratingChanges.player1.newRating})`,
    read: false,
    priority: 'normal',
    data: {
      requiresAction: false
    }
  });

  // Notificar jugador 2
  await createNotification({
    userId: player2Id,
    type: 'result_verified',
    title: '✓ Resultado Verificado',
    message: `Tu resultado contra ${player1Name} fue verificado.

Rating: ${ratingChanges.player2.change > 0 ? '+' : ''}${ratingChanges.player2.change} pts (${ratingChanges.player2.oldRating} → ${ratingChanges.player2.newRating})`,
    read: false,
    priority: 'normal',
    data: {
      requiresAction: false
    }
  });
}

/**
 * Obtener notificaciones de un usuario
 */
export function subscribeToNotifications(
  userId: string,
  callback: (notifications: Notification[]) => void
) {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    } as Notification));

    // Ordenar: no leídas primero, luego por fecha
    notifications.sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    callback(notifications);
  });
}

/**
 * Marcar como leída
 */
export async function markAsRead(notificationId: string): Promise<void> {
  await updateDoc(doc(db, 'notifications', notificationId), {
    read: true
  });
}

/**
 * Marcar todas como leídas
 */
export async function markAllAsRead(userId: string): Promise<void> {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('read', '==', false)
  );

  const snapshot = await getDocs(q);
  const updates = snapshot.docs.map(doc => 
    updateDoc(doc.ref, { read: true })
  );

  await Promise.all(updates);
}
