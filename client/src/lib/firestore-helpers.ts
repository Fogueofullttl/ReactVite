import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  User,
  Tournament,
  TournamentRegistration,
  Match,
  RatingHistory,
} from "@shared/schema";

// Collection names
export const COLLECTIONS = {
  USERS: "users",
  TOURNAMENTS: "tournaments",
  REGISTRATIONS: "tournament_registrations",
  MATCHES: "matches",
  RATING_HISTORY: "rating_history",
} as const;

// Helper to convert Firestore timestamps to ISO strings
const convertTimestamps = (data: DocumentData) => {
  const converted = { ...data };
  Object.keys(converted).forEach((key) => {
    if (converted[key] instanceof Timestamp) {
      converted[key] = converted[key].toDate().toISOString();
    }
  });
  return converted;
};

// User operations
export async function getUser(userId: string): Promise<User | null> {
  const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
  if (!userDoc.exists()) return null;
  return { id: userDoc.id, ...convertTimestamps(userDoc.data()) } as User;
}

export async function createUser(userId: string, userData: Omit<User, "id">): Promise<User> {
  await setDoc(doc(db, COLLECTIONS.USERS, userId), userData);
  return { id: userId, ...userData };
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.USERS, userId), updates);
}

// Tournament operations
export async function getTournament(tournamentId: string): Promise<Tournament | null> {
  const tournamentDoc = await getDoc(doc(db, COLLECTIONS.TOURNAMENTS, tournamentId));
  if (!tournamentDoc.exists()) return null;
  return { id: tournamentDoc.id, ...convertTimestamps(tournamentDoc.data()) } as Tournament;
}

export async function getAllTournaments(): Promise<Tournament[]> {
  const tournamentsSnapshot = await getDocs(collection(db, COLLECTIONS.TOURNAMENTS));
  return tournamentsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  })) as Tournament[];
}

export async function createTournament(tournamentData: Omit<Tournament, "id">): Promise<Tournament> {
  const tournamentRef = doc(collection(db, COLLECTIONS.TOURNAMENTS));
  await setDoc(tournamentRef, tournamentData);
  return { id: tournamentRef.id, ...tournamentData };
}

export async function updateTournament(tournamentId: string, updates: Partial<Tournament>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.TOURNAMENTS, tournamentId), updates);
}

// Tournament Registration operations
export async function getTournamentRegistrations(tournamentId: string): Promise<TournamentRegistration[]> {
  const q = query(
    collection(db, COLLECTIONS.REGISTRATIONS),
    where("tournamentId", "==", tournamentId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  })) as TournamentRegistration[];
}

export async function createRegistration(
  registrationData: Omit<TournamentRegistration, "id">
): Promise<TournamentRegistration> {
  const registrationRef = doc(collection(db, COLLECTIONS.REGISTRATIONS));
  await setDoc(registrationRef, registrationData);
  return { id: registrationRef.id, ...registrationData };
}

export async function updateRegistration(
  registrationId: string,
  updates: Partial<TournamentRegistration>
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.REGISTRATIONS, registrationId), updates);
}

// Match operations
export async function getMatch(matchId: string): Promise<Match | null> {
  const matchDoc = await getDoc(doc(db, COLLECTIONS.MATCHES, matchId));
  if (!matchDoc.exists()) return null;
  return { id: matchDoc.id, ...convertTimestamps(matchDoc.data()) } as Match;
}

export async function getTournamentMatches(tournamentId: string): Promise<Match[]> {
  const q = query(
    collection(db, COLLECTIONS.MATCHES),
    where("tournamentId", "==", tournamentId),
    orderBy("roundNumber"),
    orderBy("matchNumber")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  })) as Match[];
}

export async function createMatch(matchData: Omit<Match, "id">): Promise<Match> {
  const matchRef = doc(collection(db, COLLECTIONS.MATCHES));
  await setDoc(matchRef, matchData);
  return { id: matchRef.id, ...matchData };
}

export async function updateMatch(matchId: string, updates: Partial<Match>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.MATCHES, matchId), updates);
}

// Rating History operations
export async function getPlayerRatingHistory(playerId: string): Promise<RatingHistory[]> {
  const q = query(
    collection(db, COLLECTIONS.RATING_HISTORY),
    where("playerId", "==", playerId),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  })) as RatingHistory[];
}

export async function createRatingHistory(historyData: Omit<RatingHistory, "id">): Promise<RatingHistory> {
  const historyRef = doc(collection(db, COLLECTIONS.RATING_HISTORY));
  await setDoc(historyRef, historyData);
  return { id: historyRef.id, ...historyData };
}

// Rankings query
export async function getTopPlayers(limitCount: number = 100): Promise<User[]> {
  const q = query(
    collection(db, COLLECTIONS.USERS),
    where("role", "==", "player"),
    orderBy("rating", "desc"),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  })) as User[];
}
