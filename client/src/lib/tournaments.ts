import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  arrayUnion
} from 'firebase/firestore';
import { db } from './firebase';
import { createTournamentSchema } from './schemas/tournament';

export interface Tournament {
  id?: string;
  name: string;
  venue: string;
  date: Date;
  time: string;
  status: 'draft' | 'registration_open' | 'registration_closed' | 'in_progress' | 'completed';
  type: 'singles_male' | 'singles_female' | 'doubles_male' | 'doubles_female' | 'doubles_mixed';
  category: string;
  config: {
    maxParticipants: number | null;
    registrationDeadline: Date;
    participationFee: number;
    requiresActiveMembership: boolean;
    drawType: 'automatic' | 'manual';
    groupStage: {
      enabled: boolean;
      playersPerGroup: 3 | 4 | 5;
      advancePerGroup: 1 | 2 | 3 | 4;
    };
    eliminationStage: {
      enabled: boolean;
      format: 'single_elimination';
    };
  };
  registrations: Array<{
    userId: string | string[];
    registeredAt: Date;
    paymentStatus: 'unpaid' | 'paid';
    paymentCode?: string;
    status: 'pending' | 'confirmed';
  }>;
  draw: {
    groups: Array<{
      groupId: string;
      participants: string[];
      matchIds: string[];
    }>;
    eliminationBracket: {
      round: string;
      matchIds: string[];
    };
  } | null;
  director: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function createTournament(tournament: Omit<Tournament, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const validationResult = createTournamentSchema.safeParse(tournament);
  
  if (!validationResult.success) {
    const firstError = validationResult.error.errors[0];
    throw new Error(firstError.message);
  }
  
  const validatedTournament = validationResult.data;
  
  const tournamentsRef = collection(db, 'tournaments');
  const docRef = doc(tournamentsRef);
  
  const registrationsWithTimestamps = validatedTournament.registrations.map(reg => ({
    ...reg,
    registeredAt: Timestamp.fromDate(reg.registeredAt)
  }));
  
  await setDoc(docRef, {
    ...validatedTournament,
    date: Timestamp.fromDate(validatedTournament.date),
    config: {
      ...validatedTournament.config,
      registrationDeadline: Timestamp.fromDate(validatedTournament.config.registrationDeadline)
    },
    registrations: registrationsWithTimestamps,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  
  return docRef.id;
}

export async function getTournament(tournamentId: string): Promise<Tournament | null> {
  const docRef = doc(db, 'tournaments', tournamentId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      date: data.date?.toDate(),
      config: {
        ...data.config,
        registrationDeadline: data.config.registrationDeadline?.toDate()
      },
      registrations: data.registrations?.map((reg: any) => ({
        ...reg,
        registeredAt: reg.registeredAt?.toDate()
      })) || [],
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate()
    } as Tournament;
  }
  
  return null;
}

export async function getAllTournaments(): Promise<Tournament[]> {
  const q = query(collection(db, 'tournaments'), orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: data.date?.toDate(),
      config: {
        ...data.config,
        registrationDeadline: data.config.registrationDeadline?.toDate()
      },
      registrations: data.registrations?.map((reg: any) => ({
        ...reg,
        registeredAt: reg.registeredAt?.toDate()
      })) || [],
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate()
    } as Tournament;
  });
}

export async function openRegistration(tournamentId: string): Promise<void> {
  await updateDoc(doc(db, 'tournaments', tournamentId), {
    status: 'registration_open',
    updatedAt: Timestamp.now()
  });
}

export async function closeRegistration(tournamentId: string): Promise<void> {
  await updateDoc(doc(db, 'tournaments', tournamentId), {
    status: 'registration_closed',
    updatedAt: Timestamp.now()
  });
}

export async function registerPlayer(
  tournamentId: string,
  userId: string | string[],
  paymentCode?: string
): Promise<void> {
  const docRef = doc(db, 'tournaments', tournamentId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    throw new Error('Torneo no encontrado');
  }
  
  const newRegistration = {
    userId,
    registeredAt: Timestamp.fromDate(new Date()),
    paymentStatus: paymentCode ? 'paid' : 'unpaid' as const,
    paymentCode,
    status: 'pending' as const
  };
  
  await updateDoc(docRef, {
    registrations: arrayUnion(newRegistration),
    updatedAt: Timestamp.now()
  });
}

export async function updateTournamentStatus(
  tournamentId: string,
  status: Tournament['status']
): Promise<void> {
  await updateDoc(doc(db, 'tournaments', tournamentId), {
    status,
    updatedAt: Timestamp.now()
  });
}

export async function getTournamentsByStatus(status: Tournament['status']): Promise<Tournament[]> {
  const q = query(
    collection(db, 'tournaments'),
    where('status', '==', status),
    orderBy('date', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: data.date?.toDate(),
      config: {
        ...data.config,
        registrationDeadline: data.config.registrationDeadline?.toDate()
      },
      registrations: data.registrations?.map((reg: any) => ({
        ...reg,
        registeredAt: reg.registeredAt?.toDate()
      })) || [],
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate()
    } as Tournament;
  });
}
