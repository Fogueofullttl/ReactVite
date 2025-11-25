import { db } from "./firebase";
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  runTransaction
} from "firebase/firestore";

/**
 * Genera un número de miembro único en formato PRTTM-XXXXXX
 * Usa un contador en Firestore con transacciones para garantizar unicidad bajo concurrencia
 */
export async function generateMemberNumber(): Promise<string> {
  const counterRef = doc(db, 'counters', 'memberNumbers');
  
  try {
    // Usar transacción para garantizar atomicidad
    const nextNumber = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      
      let current = 0;
      if (counterDoc.exists()) {
        current = counterDoc.data().current || 0;
      }
      
      const next = current + 1;
      transaction.set(counterRef, { current: next });
      
      return next;
    });
    
    // Formatear con 6 dígitos
    return `PRTTM-${nextNumber.toString().padStart(6, '0')}`;
  } catch (error) {
    console.error("Error generando número de miembro:", error);
    throw new Error("No se pudo generar el número de miembro");
  }
}

/**
 * Verifica si un email ya está registrado en Firestore
 */
export async function isEmailRegistered(email: string): Promise<boolean> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error verificando email:", error);
    return false;
  }
}

/**
 * Interfaz de datos de usuario en Firestore
 */
export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  memberNumber: string;
  birthYear: number;
  club?: string;
  role: 'owner' | 'admin' | 'arbitro' | 'jugador' | 'publico';
  rating: number;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Crea un perfil de usuario en Firestore (solo si no existe)
 * Retorna el perfil existente si el usuario ya estaba registrado
 */
export async function createUserProfile(
  uid: string,
  data: {
    email: string;
    firstName: string;
    lastName: string;
    birthYear: number;
    club?: string;
    photoURL?: string;
  }
): Promise<UserProfile> {
  try {
    const userRef = doc(db, 'users', uid);
    
    // Verificar si el perfil ya existe
    const existingDoc = await getDoc(userRef);
    if (existingDoc.exists()) {
      // Usuario ya existe, retornar perfil existente
      const existingData = existingDoc.data();
      return {
        ...existingData,
        createdAt: new Date(existingData.createdAt),
        updatedAt: new Date(existingData.updatedAt)
      } as UserProfile;
    }
    
    // Usuario nuevo, generar número de miembro y crear perfil
    const memberNumber = await generateMemberNumber();
    const now = new Date();
    
    const userProfile: UserProfile = {
      uid,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      displayName: `${data.firstName} ${data.lastName}`,
      memberNumber,
      birthYear: data.birthYear,
      club: data.club || "",
      role: 'jugador', // Rol por defecto
      rating: 1000, // Rating inicial
      photoURL: data.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.firstName}`,
      createdAt: now,
      updatedAt: now
    };
    
    await setDoc(userRef, {
      ...userProfile,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    });
    
    return userProfile;
  } catch (error) {
    console.error("Error creando perfil de usuario:", error);
    throw new Error("No se pudo crear el perfil de usuario");
  }
}

/**
 * Obtiene el perfil de usuario desde Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt)
      } as UserProfile;
    }
    
    return null;
  } catch (error) {
    console.error("Error obteniendo perfil de usuario:", error);
    return null;
  }
}
