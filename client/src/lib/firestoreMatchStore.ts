import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where,
  onSnapshot,
  Timestamp,
  type Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';
import type { Match, MatchStatus, MatchResult } from '@/data/mockMatches';
import { calculateRatingChange } from './ratingSystem';

const matchesRef = collection(db, 'matches');

/**
 * Convierte un documento de Firestore a Match con conversión de Timestamps
 */
function firestoreToMatch(docData: any, id: string): Match {
  return {
    id,
    ...docData,
    scheduledTime: docData.scheduledTime?.toDate ? docData.scheduledTime.toDate() : new Date(docData.scheduledTime),
    result: docData.result ? {
      ...docData.result,
      enteredAt: docData.result.enteredAt?.toDate ? docData.result.enteredAt.toDate() : new Date(docData.result.enteredAt),
      validatedBy: Object.fromEntries(
        Object.entries(docData.result.validatedBy || {}).map(([key, val]: [string, any]) => [
          key,
          {
            ...val,
            timestamp: val.timestamp?.toDate ? val.timestamp.toDate() : new Date(val.timestamp)
          }
        ])
      )
    } : undefined,
    verifiedAt: docData.verifiedAt?.toDate ? docData.verifiedAt.toDate() : (docData.verifiedAt ? new Date(docData.verifiedAt) : undefined),
    rejectedAt: docData.rejectedAt?.toDate ? docData.rejectedAt.toDate() : (docData.rejectedAt ? new Date(docData.rejectedAt) : undefined),
  } as Match;
}

/**
 * Convierte un Match a formato Firestore con Timestamps
 */
function matchToFirestore(match: Partial<Match>): any {
  const data: any = { ...match };
  
  // Convertir Dates a Timestamps
  if (data.scheduledTime instanceof Date) {
    data.scheduledTime = Timestamp.fromDate(data.scheduledTime);
  }
  
  if (data.result) {
    if (data.result.enteredAt instanceof Date) {
      data.result.enteredAt = Timestamp.fromDate(data.result.enteredAt);
    }
    
    if (data.result.validatedBy) {
      const validatedBy: any = {};
      for (const [key, val] of Object.entries(data.result.validatedBy)) {
        validatedBy[key] = {
          ...(val as any),
          timestamp: (val as any).timestamp instanceof Date 
            ? Timestamp.fromDate((val as any).timestamp) 
            : (val as any).timestamp
        };
      }
      data.result.validatedBy = validatedBy;
    }
  }
  
  if (data.verifiedAt instanceof Date) {
    data.verifiedAt = Timestamp.fromDate(data.verifiedAt);
  }
  
  if (data.rejectedAt instanceof Date) {
    data.rejectedAt = Timestamp.fromDate(data.rejectedAt);
  }
  
  return data;
}

/**
 * Obtiene todos los partidos de Firestore
 */
export async function getAllMatches(): Promise<Match[]> {
  try {
    const snapshot = await getDocs(matchesRef);
    return snapshot.docs.map(doc => firestoreToMatch(doc.data(), doc.id));
  } catch (error) {
    console.error("Error obteniendo partidos:", error);
    return [];
  }
}

/**
 * Obtiene un partido específico por ID
 */
export async function getMatch(matchId: string): Promise<Match | null> {
  try {
    const docRef = doc(db, 'matches', matchId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return firestoreToMatch(docSnap.data(), docSnap.id);
    }
    return null;
  } catch (error) {
    console.error(`Error obteniendo partido ${matchId}:`, error);
    return null;
  }
}

/**
 * Actualiza un partido
 */
export async function updateMatch(matchId: string, updates: Partial<Match>): Promise<Match | null> {
  try {
    const docRef = doc(db, 'matches', matchId);
    const firestoreData = matchToFirestore(updates);
    
    await updateDoc(docRef, {
      ...firestoreData,
      updatedAt: Timestamp.now()
    });
    
    // Retornar el partido actualizado
    return await getMatch(matchId);
  } catch (error) {
    console.error(`Error actualizando partido ${matchId}:`, error);
    return null;
  }
}

/**
 * Crea un nuevo partido
 */
export async function createMatch(match: Omit<Match, 'id'>): Promise<string | null> {
  try {
    const docRef = doc(matchesRef);
    const firestoreData = matchToFirestore(match);
    
    await setDoc(docRef, {
      ...firestoreData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Error creando partido:", error);
    return null;
  }
}

/**
 * Guarda resultado ingresado por árbitro (se verifica inmediatamente)
 */
export async function saveMatchResult(
  matchId: string,
  sets: Array<{ player1: number; player2: number }>,
  winnerId: string,
  enteredBy: string,
  observations?: string
): Promise<Match | null> {
  try {
    const match = await getMatch(matchId);
    if (!match) {
      console.error("Match not found:", matchId);
      return null;
    }
    
    const player1Wins = sets.filter(s => s.player1 > s.player2).length;
    const player2Wins = sets.filter(s => s.player1 < s.player2).length;
    
    // Calcular cambio de rating usando sistema oficial FPTM
    const ratingChange = calculateRatingChange(
      match.player1,
      match.player2,
      { sets, winner: winnerId }
    );
    
    const result: MatchResult = {
      sets,
      winner: winnerId,
      setsCount: { player1: player1Wins, player2: player2Wins },
      validatedBy: {
        [match.player1.id]: { validated: true, timestamp: new Date() },
        [match.player2.id]: { validated: true, timestamp: new Date() }
      },
      enteredBy,
      enteredAt: new Date(),
      observations,
      ratingChange: {
        player1: ratingChange.player1,
        player2: ratingChange.player2,
        ratingDifference: ratingChange.ratingDifference
      }
    };
    
    // Actualizar ratings de jugadores
    const updatedPlayer1 = { ...match.player1, rating: ratingChange.player1.newRating };
    const updatedPlayer2 = { ...match.player2, rating: ratingChange.player2.newRating };
    
    return await updateMatch(matchId, {
      status: "verified" as const,
      result,
      player1: updatedPlayer1,
      player2: updatedPlayer2,
      verifiedBy: enteredBy,
      verifiedAt: new Date(),
      waitingAdminApproval: false
    });
  } catch (error) {
    console.error("Error guardando resultado de árbitro:", error);
    throw new Error("No se pudo guardar el resultado del partido");
  }
}

/**
 * Guarda resultado ingresado por jugador (pendiente de verificación)
 */
export async function savePlayerResult(
  matchId: string,
  sets: Array<{ player1: number; player2: number }>,
  winnerId: string,
  enteredBy: string,
  observations?: string
): Promise<Match | null> {
  try {
    const match = await getMatch(matchId);
    if (!match) {
      console.error("Match not found:", matchId);
      return null;
    }
    
    const player1Wins = sets.filter(s => s.player1 > s.player2).length;
    const player2Wins = sets.filter(s => s.player1 < s.player2).length;
    
    // Calcular cambio de rating proyectado
    const ratingChange = calculateRatingChange(
      match.player1,
      match.player2,
      { sets, winner: winnerId }
    );
    
    const result: MatchResult = {
      sets,
      winner: winnerId,
      setsCount: { player1: player1Wins, player2: player2Wins },
      validatedBy: {
        [enteredBy]: { validated: true, timestamp: new Date() }
      },
      enteredBy,
      enteredAt: new Date(),
      observations,
      ratingChange: {
        player1: ratingChange.player1,
        player2: ratingChange.player2,
        ratingDifference: ratingChange.ratingDifference
      }
    };
    
    return await updateMatch(matchId, {
      status: "pending_verification" as const,
      result,
      waitingAdminApproval: true,
      verifiedBy: undefined,
      verifiedAt: undefined
    });
  } catch (error) {
    console.error("Error guardando resultado de jugador:", error);
    throw new Error("No se pudo guardar el resultado del jugador");
  }
}

/**
 * Aprueba un resultado pendiente de verificación
 */
export async function approveResult(matchId: string, adminId: string): Promise<Match | null> {
  try {
    const match = await getMatch(matchId);
    if (!match || !match.result) return null;
    
    // Aplicar cambios de rating
    const updatedPlayer1 = { 
      ...match.player1, 
      rating: match.result.ratingChange!.player1.newRating 
    };
    const updatedPlayer2 = { 
      ...match.player2, 
      rating: match.result.ratingChange!.player2.newRating 
    };
    
    return await updateMatch(matchId, {
      status: "verified" as const,
      player1: updatedPlayer1,
      player2: updatedPlayer2,
      verifiedBy: adminId,
      verifiedAt: new Date(),
      waitingAdminApproval: false
    });
  } catch (error) {
    console.error("Error aprobando resultado:", error);
    return null;
  }
}

/**
 * Rechaza un resultado pendiente de verificación
 */
export async function rejectResult(
  matchId: string, 
  adminId: string, 
  reason: string
): Promise<Match | null> {
  try {
    const match = await getMatch(matchId);
    if (!match) {
      console.error("Match not found:", matchId);
      return null;
    }
    
    return await updateMatch(matchId, {
      status: "rejected" as const,
      rejectedBy: adminId,
      rejectedAt: new Date(),
      rejectionReason: reason,
      waitingAdminApproval: false,
      result: undefined,
      verifiedBy: undefined,
      verifiedAt: undefined
    });
  } catch (error) {
    console.error("Error rechazando resultado:", error);
    throw new Error("No se pudo rechazar el resultado");
  }
}

/**
 * Suscripción en tiempo real para partidos
 */
export function subscribeToMatches(
  callback: (matches: Match[]) => void,
  filters?: { 
    referee?: string;
    status?: MatchStatus | MatchStatus[];
    playerId?: string;
  }
): Unsubscribe {
  try {
    let q = query(matchesRef);
    
    // Filtro por árbitro
    if (filters?.referee) {
      q = query(q, where('referee', '==', filters.referee));
    }
    
    // Filtro por status
    if (filters?.status) {
      if (Array.isArray(filters.status)) {
        q = query(q, where('status', 'in', filters.status));
      } else {
        q = query(q, where('status', '==', filters.status));
      }
    }
    
    return onSnapshot(q, (snapshot) => {
      let matches = snapshot.docs.map(doc => firestoreToMatch(doc.data(), doc.id));
      
      // Filtro adicional por playerId (no se puede hacer con where compuesto)
      if (filters?.playerId) {
        matches = matches.filter(m => 
          m.player1.id === filters.playerId || 
          m.player2.id === filters.playerId
        );
      }
      
      callback(matches);
    }, (error) => {
      console.error("Error en suscripción de partidos:", error);
      callback([]);
    });
  } catch (error) {
    console.error("Error creando suscripción:", error);
    return () => {};
  }
}

/**
 * Obtiene partidos por árbitro
 */
export async function getMatchesByReferee(refereeId: string): Promise<Match[]> {
  try {
    const q = query(matchesRef, where('referee', '==', refereeId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => firestoreToMatch(doc.data(), doc.id));
  } catch (error) {
    console.error("Error obteniendo partidos por árbitro:", error);
    return [];
  }
}

/**
 * Obtiene partidos por jugador
 */
export async function getMatchesByPlayer(playerId: string): Promise<Match[]> {
  try {
    const allMatches = await getAllMatches();
    return allMatches.filter(m => 
      m.player1.id === playerId || m.player2.id === playerId
    );
  } catch (error) {
    console.error("Error obteniendo partidos por jugador:", error);
    return [];
  }
}
