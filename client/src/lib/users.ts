import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface UserProfile {
  uid: string;
  email?: string;
  memberNumber?: string;
  role?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    club?: string;
    rating?: number;
    tournamentsPlayed?: number;
    wins?: number;
    losses?: number;
    photoURL?: string;
    membershipStatus?: string;
    birthYear?: number;
    gender?: 'male' | 'female';
  };
  firstName?: string;
  lastName?: string;
  club?: string;
  rating?: number;
  tournamentsPlayed?: number;
  wins?: number;
  losses?: number;
  photoURL?: string;
  membershipStatus?: string;
  birthYear?: number;
  gender?: 'male' | 'female';
}

export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    })) as UserProfile[];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export async function getUserById(userId: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        uid: docSnap.id,
        ...docSnap.data()
      } as UserProfile;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export async function updateUserStats(
  userId: string, 
  stats: { 
    wins?: number; 
    losses?: number; 
    tournamentsPlayed?: number;
    rating?: number;
  }
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const profile = userData.profile || {};
      
      const updates: any = {
        'profile.wins': (profile.wins || 0) + (stats.wins || 0),
        'profile.losses': (profile.losses || 0) + (stats.losses || 0),
      };
      
      if (stats.tournamentsPlayed) {
        updates['profile.tournamentsPlayed'] = (profile.tournamentsPlayed || 0) + stats.tournamentsPlayed;
      }
      
      if (stats.rating !== undefined) {
        updates['profile.rating'] = stats.rating;
      }
      
      await updateDoc(userRef, updates);
    }
  } catch (error) {
    console.error('Error updating user stats:', error);
    throw error;
  }
}
