import { collection, doc, getDoc, setDoc, getDocs, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface RankingEntry {
  position: number;
  userId: string;
  memberNumber: string;
  name: string;
  club: string;
  rating: number;
  tournamentsPlayed: number;
  wins: number;
  losses: number;
  photoURL?: string;
  lastChange: number;
  trend: 'up' | 'down' | 'stable' | 'new';
}

export interface Rankings {
  category: string;
  lastUpdated: Date;
  top10: RankingEntry[];
}

export type RankingCategory = 
  | 'singles_male' 
  | 'singles_female' 
  | 'doubles_male' 
  | 'doubles_female' 
  | 'doubles_mixed';

export async function getRankings(category: string): Promise<RankingEntry[]> {
  try {
    const docRef = doc(db, 'rankings', category);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.top10 || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching rankings:', error);
    return [];
  }
}

export async function recalculateRankings(tournamentType: string): Promise<void> {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = usersSnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    })) as any[];
    
    const players = users
      .filter(u => u.role === 'jugador')
      .sort((a, b) => (b.profile?.rating || b.rating || 1000) - (a.profile?.rating || a.rating || 1000));
    
    const previousRankings = await getRankings(tournamentType);
    
    const top10: RankingEntry[] = players.slice(0, 10).map((player, index) => {
      const position = index + 1;
      const previousEntry = previousRankings.find(r => r.userId === player.uid);
      const previousPosition = previousEntry?.position || 0;
      
      let trend: 'up' | 'down' | 'stable' | 'new' = 'stable';
      let lastChange = 0;
      
      if (!previousEntry) {
        trend = 'new';
      } else {
        lastChange = previousPosition - position;
        if (lastChange > 0) trend = 'up';
        else if (lastChange < 0) trend = 'down';
      }
      
      const profile = player.profile || player;
      
      return {
        position,
        userId: player.uid,
        memberNumber: player.memberNumber || '',
        name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Sin nombre',
        club: profile.club || '',
        rating: profile.rating || 1000,
        tournamentsPlayed: profile.tournamentsPlayed || 0,
        wins: profile.wins || 0,
        losses: profile.losses || 0,
        photoURL: profile.photoURL,
        lastChange,
        trend
      };
    });
    
    await setDoc(doc(db, 'rankings', tournamentType), {
      category: tournamentType,
      lastUpdated: Timestamp.now(),
      top10
    });
  } catch (error) {
    console.error('Error recalculating rankings:', error);
    throw error;
  }
}

export async function initializeRankings(): Promise<void> {
  const categories: RankingCategory[] = [
    'singles_male',
    'singles_female', 
    'doubles_male',
    'doubles_female',
    'doubles_mixed'
  ];
  
  for (const category of categories) {
    await recalculateRankings(category);
  }
}
