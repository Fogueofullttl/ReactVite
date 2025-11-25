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
import { createMatch } from './firestoreMatchStore';
import { recalculateRankings } from './rankings';

export interface TournamentRestrictions {
  minAge?: number;
  maxAge?: number;
  gender?: 'male' | 'female' | 'any';
  minRating?: number;
  maxRating?: number;
}

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
    restrictions?: TournamentRestrictions;
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
  
  const data = docSnap.data();
  const tournament = {
    id: docSnap.id,
    ...data,
    date: data.date?.toDate(),
    config: {
      ...data.config,
      registrationDeadline: data.config.registrationDeadline?.toDate()
    },
    registrations: data.registrations || [],
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate()
  } as Tournament;
  
  const primaryUserId = Array.isArray(userId) ? userId[0] : userId;
  const validation = await validateRegistrationInternal(tournament, primaryUserId);
  
  if (!validation.valid) {
    throw new Error(validation.reason || 'No cumples los requisitos para inscribirte');
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

async function validateRegistrationInternal(
  tournament: Tournament,
  userId: string
): Promise<{ valid: boolean; reason?: string }> {
  const restrictions = tournament.config.restrictions;
  
  if (!restrictions) {
    return { valid: true };
  }
  
  const userDoc = await getDoc(doc(db, 'users', userId));
  const userData = userDoc.data();
  
  if (!userData) {
    return { valid: false, reason: 'Usuario no encontrado' };
  }
  
  const profile = userData.profile || userData;
  const currentYear = new Date().getFullYear();
  const age = profile.birthYear ? currentYear - profile.birthYear : null;
  const rating = profile.rating || 1000;
  const userGender = profile.gender;
  
  if (restrictions.minAge && age !== null && age < restrictions.minAge) {
    return { 
      valid: false, 
      reason: `Edad minima requerida: ${restrictions.minAge} anos. Tu edad: ${age} anos` 
    };
  }
  
  if (restrictions.maxAge && age !== null && age > restrictions.maxAge) {
    return { 
      valid: false, 
      reason: `Edad maxima permitida: ${restrictions.maxAge} anos. Tu edad: ${age} anos` 
    };
  }
  
  if (restrictions.gender && restrictions.gender !== 'any') {
    if (userGender && userGender !== restrictions.gender) {
      const genderLabel = restrictions.gender === 'male' ? 'masculino' : 'femenino';
      return { 
        valid: false, 
        reason: `Este torneo es exclusivamente ${genderLabel}` 
      };
    }
  }
  
  if (restrictions.minRating && rating < restrictions.minRating) {
    return { 
      valid: false, 
      reason: `Rating minimo requerido: ${restrictions.minRating}. Tu rating: ${rating}` 
    };
  }
  
  if (restrictions.maxRating && rating > restrictions.maxRating) {
    return { 
      valid: false, 
      reason: `Rating maximo permitido: ${restrictions.maxRating}. Tu rating: ${rating}` 
    };
  }
  
  return { valid: true };
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

export async function confirmRegistration(
  tournamentId: string,
  registrationIndex: number
): Promise<void> {
  const tournament = await getTournament(tournamentId);
  if (!tournament) throw new Error('Torneo no encontrado');
  
  if (registrationIndex < 0 || registrationIndex >= tournament.registrations.length) {
    throw new Error('Indice de inscripcion invalido');
  }
  
  const registrations = [...tournament.registrations];
  registrations[registrationIndex].status = 'confirmed';
  registrations[registrationIndex].paymentStatus = 'paid';
  
  await updateDoc(doc(db, 'tournaments', tournamentId), {
    registrations: registrations.map(reg => ({
      ...reg,
      registeredAt: Timestamp.fromDate(reg.registeredAt)
    })),
    updatedAt: Timestamp.now()
  });
}

/**
 * Redistribuye jugadores para evitar que jugadores del mismo club
 * queden en el mismo grupo. Alterna entre clubes al asignar.
 */
function redistributeByClub(players: any[]): any[] {
  // Agrupar por club
  const byClub = new Map<string, any[]>();
  players.forEach(p => {
    const profile = p.userData?.profile || p.userData;
    const club = profile?.club || 'Sin Club';
    if (!byClub.has(club)) byClub.set(club, []);
    byClub.get(club)!.push(p);
  });
  
  // Si solo hay un club, no hay nada que redistribuir
  if (byClub.size <= 1) return players;
  
  // Ordenar clubes por cantidad de jugadores (más a menos)
  const clubs = Array.from(byClub.keys()).sort(
    (a, b) => byClub.get(b)!.length - byClub.get(a)!.length
  );
  
  // Dispersar jugadores alternando entre clubes
  const result: any[] = [];
  let clubIndex = 0;
  
  while (result.length < players.length) {
    const club = clubs[clubIndex % clubs.length];
    const clubPlayers = byClub.get(club)!;
    
    if (clubPlayers.length > 0) {
      result.push(clubPlayers.shift()!);
    }
    
    clubIndex++;
    
    // Si todos los clubes están vacíos en esta vuelta, resetear
    if (result.length < players.length) {
      const anyLeft = clubs.some(c => byClub.get(c)!.length > 0);
      if (!anyLeft) break;
    }
  }
  
  return result;
}

export async function generateDraw(tournamentId: string): Promise<void> {
  const tournament = await getTournament(tournamentId);
  if (!tournament) throw new Error('Torneo no encontrado');
  
  const confirmedRegistrations = tournament.registrations.filter(r => r.status === 'confirmed');
  if (confirmedRegistrations.length === 0) {
    throw new Error('No hay jugadores confirmados para el sorteo');
  }
  
  const players = await Promise.all(
    confirmedRegistrations.map(async (reg) => {
      const userId = Array.isArray(reg.userId) ? reg.userId[0] : reg.userId;
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();
      return {
        userId: reg.userId,
        rating: userData?.profile?.rating || userData?.rating || 1000,
        userData: userData
      };
    })
  );
  
  // Ordenar por rating primero
  const sortedPlayers = players.sort((a, b) => b.rating - a.rating);
  
  // Redistribuir para evitar mismo club en mismo grupo
  const redistributedPlayers = redistributeByClub(sortedPlayers);
  
  const draw: any = {
    groups: [],
    eliminationBracket: { round: '', matchIds: [] }
  };
  
  if (tournament.config.groupStage.enabled) {
    const playersPerGroup = tournament.config.groupStage.playersPerGroup;
    const numGroups = Math.ceil(redistributedPlayers.length / playersPerGroup);
    
    const groups: Array<{groupId: string; participants: string[]; matchIds: string[]}> = [];
    for (let i = 0; i < numGroups; i++) {
      groups.push({
        groupId: String.fromCharCode(65 + i),
        participants: [],
        matchIds: []
      });
    }
    
    redistributedPlayers.forEach((player, index) => {
      const roundNumber = Math.floor(index / numGroups);
      const positionInRound = index % numGroups;
      const groupIndex = roundNumber % 2 === 0 
        ? positionInRound 
        : (numGroups - 1) - positionInRound;
      const userId = Array.isArray(player.userId) ? player.userId[0] : player.userId;
      groups[groupIndex].participants.push(userId);
    });
    
    for (const group of groups) {
      const matchIds = await generateRoundRobinMatches(
        tournament,
        group.groupId,
        group.participants,
        redistributedPlayers
      );
      group.matchIds = matchIds;
    }
    
    draw.groups = groups;
  }
  
  if (tournament.config.eliminationStage.enabled && !tournament.config.groupStage.enabled) {
    const matchIds = await generateEliminationBracket(
      tournament,
      sortedPlayers.map(p => Array.isArray(p.userId) ? p.userId[0] : p.userId)
    );
    draw.eliminationBracket = {
      round: determineFirstRound(sortedPlayers.length),
      matchIds
    };
  }
  
  await updateDoc(doc(db, 'tournaments', tournamentId), {
    draw,
    status: 'in_progress',
    updatedAt: Timestamp.now()
  });
}

async function generateRoundRobinMatches(
  tournament: Tournament,
  groupId: string,
  participants: string[],
  allPlayers: any[]
): Promise<string[]> {
  const matchIds: string[] = [];
  let matchIndex = 0;
  
  for (let i = 0; i < participants.length; i++) {
    for (let j = i + 1; j < participants.length; j++) {
      const player1Id = participants[i];
      const player2Id = participants[j];
      
      const player1Data = allPlayers.find(p => {
        const pId = Array.isArray(p.userId) ? p.userId[0] : p.userId;
        return pId === player1Id;
      })?.userData;
      
      const player2Data = allPlayers.find(p => {
        const pId = Array.isArray(p.userId) ? p.userId[0] : p.userId;
        return pId === player2Id;
      })?.userData;
      
      const p1Profile = player1Data?.profile || player1Data;
      const p2Profile = player2Data?.profile || player2Data;
      
      const scheduledTime = new Date(tournament.date.getTime() + (matchIndex * 15 * 60 * 1000));
      
      const matchId = await createMatch({
        tournamentId: tournament.id!,
        tournamentName: tournament.name,
        stage: 'groups',
        round: `Grupo ${groupId}`,
        mesa: (matchIndex % 4) + 1,
        status: 'scheduled',
        scheduledTime,
        player1: {
          id: player1Id,
          name: `${p1Profile?.firstName || 'Jugador'} ${p1Profile?.lastName || '1'}`,
          birthYear: p1Profile?.birthYear || 2000,
          rating: p1Profile?.rating || 1000,
          photoURL: p1Profile?.photoURL || ''
        },
        player2: {
          id: player2Id,
          name: `${p2Profile?.firstName || 'Jugador'} ${p2Profile?.lastName || '2'}`,
          birthYear: p2Profile?.birthYear || 2000,
          rating: p2Profile?.rating || 1000,
          photoURL: p2Profile?.photoURL || ''
        }
      });
      
      if (matchId) {
        matchIds.push(matchId);
      }
      matchIndex++;
    }
  }
  
  return matchIds;
}

async function generateEliminationBracket(
  tournament: Tournament,
  participantIds: string[]
): Promise<string[]> {
  const matchIds: string[] = [];
  
  const numPlayers = participantIds.length;
  const firstRoundMatches = Math.floor(numPlayers / 2);
  
  for (let i = 0; i < firstRoundMatches; i++) {
    const player1Id = participantIds[i];
    const player2Id = participantIds[numPlayers - 1 - i];
    
    const player1Doc = await getDoc(doc(db, 'users', player1Id));
    const player2Doc = await getDoc(doc(db, 'users', player2Id));
    
    const player1Data = player1Doc.data();
    const player2Data = player2Doc.data();
    
    const p1Profile = player1Data?.profile || player1Data;
    const p2Profile = player2Data?.profile || player2Data;
    
    const scheduledTime = new Date(tournament.date.getTime() + (i * 20 * 60 * 1000));
    
    const matchId = await createMatch({
      tournamentId: tournament.id!,
      tournamentName: tournament.name,
      stage: 'elimination',
      round: determineFirstRound(numPlayers),
      mesa: (i % 4) + 1,
      status: 'scheduled',
      scheduledTime,
      player1: {
        id: player1Id,
        name: `${p1Profile?.firstName || 'Jugador'} ${p1Profile?.lastName || '1'}`,
        birthYear: p1Profile?.birthYear || 2000,
        rating: p1Profile?.rating || 1000,
        photoURL: p1Profile?.photoURL || ''
      },
      player2: {
        id: player2Id,
        name: `${p2Profile?.firstName || 'Jugador'} ${p2Profile?.lastName || '2'}`,
        birthYear: p2Profile?.birthYear || 2000,
        rating: p2Profile?.rating || 1000,
        photoURL: p2Profile?.photoURL || ''
      }
    });
    
    if (matchId) {
      matchIds.push(matchId);
    }
  }
  
  return matchIds;
}

function determineFirstRound(numPlayers: number): string {
  if (numPlayers <= 4) return 'Semifinales';
  if (numPlayers <= 8) return 'Cuartos de Final';
  if (numPlayers <= 16) return 'Octavos de Final';
  return 'Ronda de 32';
}

/**
 * Actualiza el rating de un jugador en Firestore
 */
export async function updatePlayerRating(userId: string, newRating: number): Promise<void> {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (userDoc.exists()) {
    const userData = userDoc.data();
    if (userData.profile) {
      await updateDoc(userRef, {
        'profile.rating': newRating,
        updatedAt: Timestamp.now()
      });
    } else {
      await updateDoc(userRef, {
        rating: newRating,
        updatedAt: Timestamp.now()
      });
    }
  }
}

/**
 * Finaliza un torneo y aplica todos los cambios de rating acumulados.
 * Los ratings se aplican basados en los ratingChange guardados en cada match verificado.
 */
export async function finalizeTournament(tournamentId: string): Promise<{
  playersUpdated: number;
  ratingChanges: Array<{ playerId: string; oldRating: number; newRating: number; totalChange: number }>;
}> {
  const tournament = await getTournament(tournamentId);
  if (!tournament) throw new Error('Torneo no encontrado');
  
  if (tournament.status === 'completed') {
    throw new Error('El torneo ya ha sido finalizado');
  }
  
  // Obtener TODOS los partidos verificados del torneo
  const matchesQuery = query(
    collection(db, 'matches'),
    where('tournamentId', '==', tournamentId),
    where('status', '==', 'verified')
  );
  
  const matchesSnapshot = await getDocs(matchesQuery);
  const matches = matchesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as any[];
  
  if (matches.length === 0) {
    throw new Error('No hay partidos verificados para aplicar');
  }
  
  // Acumular cambios de rating por jugador
  const ratingUpdates: Map<string, { 
    oldRating: number; 
    totalChange: number;
    currentRating: number;
  }> = new Map();
  
  for (const match of matches) {
    if (!match.result?.ratingChange) continue;
    
    const p1Id = match.player1.id;
    const p2Id = match.player2.id;
    const rc = match.result.ratingChange;
    
    // Jugador 1
    if (!ratingUpdates.has(p1Id)) {
      ratingUpdates.set(p1Id, {
        oldRating: rc.player1.oldRating,
        totalChange: 0,
        currentRating: rc.player1.oldRating
      });
    }
    const p1Data = ratingUpdates.get(p1Id)!;
    p1Data.totalChange += rc.player1.change;
    p1Data.currentRating += rc.player1.change;
    
    // Jugador 2
    if (!ratingUpdates.has(p2Id)) {
      ratingUpdates.set(p2Id, {
        oldRating: rc.player2.oldRating,
        totalChange: 0,
        currentRating: rc.player2.oldRating
      });
    }
    const p2Data = ratingUpdates.get(p2Id)!;
    p2Data.totalChange += rc.player2.change;
    p2Data.currentRating += rc.player2.change;
  }
  
  // Aplicar todos los cambios a Firestore
  const updatePromises = Array.from(ratingUpdates.entries()).map(([userId, data]) =>
    updatePlayerRating(userId, data.currentRating)
  );
  
  await Promise.all(updatePromises);
  
  // Recalcular rankings despues de aplicar ratings
  try {
    await recalculateRankings(tournament.type);
  } catch (error) {
    console.error('Error recalculando rankings:', error);
  }
  
  // Marcar torneo como completado
  await updateDoc(doc(db, 'tournaments', tournamentId), {
    status: 'completed',
    completedAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  
  // Preparar resumen de cambios
  const ratingChanges = Array.from(ratingUpdates.entries()).map(([playerId, data]) => ({
    playerId,
    oldRating: data.oldRating,
    newRating: data.currentRating,
    totalChange: data.totalChange
  }));
  
  return {
    playersUpdated: ratingUpdates.size,
    ratingChanges
  };
}

/**
 * Valida si un usuario cumple con las restricciones del torneo
 */
export async function validateRegistration(
  tournament: Tournament,
  userId: string
): Promise<{ valid: boolean; reason?: string }> {
  const restrictions = tournament.config.restrictions;
  
  // Si no hay restricciones, permitir inscripción
  if (!restrictions) {
    return { valid: true };
  }
  
  const userDoc = await getDoc(doc(db, 'users', userId));
  const userData = userDoc.data();
  
  if (!userData) {
    return { valid: false, reason: 'Usuario no encontrado' };
  }
  
  const profile = userData.profile || userData;
  const currentYear = new Date().getFullYear();
  const age = profile.birthYear ? currentYear - profile.birthYear : null;
  const rating = profile.rating || 1000;
  const userGender = profile.gender;
  
  // Validar edad mínima
  if (restrictions.minAge && age !== null && age < restrictions.minAge) {
    return { 
      valid: false, 
      reason: `Edad minima requerida: ${restrictions.minAge} anos. Tu edad: ${age} anos` 
    };
  }
  
  // Validar edad máxima
  if (restrictions.maxAge && age !== null && age > restrictions.maxAge) {
    return { 
      valid: false, 
      reason: `Edad maxima permitida: ${restrictions.maxAge} anos. Tu edad: ${age} anos` 
    };
  }
  
  // Validar género
  if (restrictions.gender && restrictions.gender !== 'any') {
    if (userGender && userGender !== restrictions.gender) {
      const genderLabel = restrictions.gender === 'male' ? 'masculino' : 'femenino';
      return { 
        valid: false, 
        reason: `Este torneo es exclusivamente ${genderLabel}` 
      };
    }
  }
  
  // Validar rating mínimo
  if (restrictions.minRating && rating < restrictions.minRating) {
    return { 
      valid: false, 
      reason: `Rating minimo requerido: ${restrictions.minRating}. Tu rating: ${rating}` 
    };
  }
  
  // Validar rating máximo
  if (restrictions.maxRating && rating > restrictions.maxRating) {
    return { 
      valid: false, 
      reason: `Rating maximo permitido: ${restrictions.maxRating}. Tu rating: ${rating}` 
    };
  }
  
  return { valid: true };
}
