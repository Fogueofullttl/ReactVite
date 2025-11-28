import type {
  User,
  InsertUser,
  Tournament,
  InsertTournament,
  TournamentRegistration,
  InsertTournamentRegistration,
  Match,
  InsertMatch,
  RatingHistory,
  InsertRatingHistory,
} from "@shared/schema";
import { getFirestore } from "./firebaseAdmin";
import type { Firestore } from "firebase-admin/firestore";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<void>;

  // Tournament operations
  getTournament(id: string): Promise<Tournament | undefined>;
  getAllTournaments(): Promise<Tournament[]>;
  createTournament(tournament: InsertTournament): Promise<Tournament>;
  updateTournament(id: string, updates: Partial<Tournament>): Promise<void>;

  // Registration operations
  getRegistration(id: string): Promise<TournamentRegistration | undefined>;
  getAllRegistrations(): Promise<TournamentRegistration[]>;
  getTournamentRegistrations(tournamentId: string): Promise<TournamentRegistration[]>;
  createRegistration(registration: InsertTournamentRegistration): Promise<TournamentRegistration>;
  updateRegistration(id: string, updates: Partial<TournamentRegistration>): Promise<void>;

  // Match operations
  getMatch(id: string): Promise<Match | undefined>;
  getTournamentMatches(tournamentId: string): Promise<Match[]>;
  getAllMatches(): Promise<Match[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: string, updates: Partial<Match>): Promise<void>;
  updateMatchAndRatings(matchId: string, updates: Partial<Match>, match: Match): Promise<void>;

  // Rating operations
  getPlayerRatingHistory(playerId: string): Promise<RatingHistory[]>;
  createRatingHistory(history: InsertRatingHistory): Promise<RatingHistory>;

  // Rankings
  getTopPlayers(limit: number): Promise<User[]>;

  // Utility
  generateMemberNumber(): Promise<string>;
  generateTournamentDraw(tournamentId: string): Promise<Match[]>;
}

/**
 * Firestore-based storage implementation
 * Collections: users, tournaments, registrations, matches, ratingHistory, counters
 */
export class FirestoreStorage implements IStorage {
  private db: Firestore;

  constructor() {
    this.db = getFirestore();
  }

  // ============================================================================
  // USER OPERATIONS
  // ============================================================================

  async getUser(id: string): Promise<User | undefined> {
    const doc = await this.db.collection("users").doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } as User : undefined;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const snapshot = await this.db.collection("users")
      .where("firebaseUid", "==", firebaseUid)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return undefined;
    }

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const memberNumber = await this.generateMemberNumber();
    const now = new Date().toISOString();

    const userData: Omit<User, "id"> = {
      ...insertUser,
      memberNumber,
      rating: 1000,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await this.db.collection("users").add(userData);
    return { id: docRef.id, ...userData };
  }

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    await this.db.collection("users").doc(id).update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  // ============================================================================
  // TOURNAMENT OPERATIONS
  // ============================================================================

  async getTournament(id: string): Promise<Tournament | undefined> {
    const doc = await this.db.collection("tournaments").doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } as Tournament : undefined;
  }

  async getAllTournaments(): Promise<Tournament[]> {
    const snapshot = await this.db.collection("tournaments").get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tournament));
  }

  async createTournament(insertTournament: InsertTournament): Promise<Tournament> {
    const now = new Date().toISOString();

    const tournamentData: Omit<Tournament, "id"> = {
      ...insertTournament,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await this.db.collection("tournaments").add(tournamentData);
    return { id: docRef.id, ...tournamentData };
  }

  async updateTournament(id: string, updates: Partial<Tournament>): Promise<void> {
    await this.db.collection("tournaments").doc(id).update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  // ============================================================================
  // REGISTRATION OPERATIONS
  // ============================================================================

  async getRegistration(id: string): Promise<TournamentRegistration | undefined> {
    const doc = await this.db.collection("registrations").doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } as TournamentRegistration : undefined;
  }

  async getAllRegistrations(): Promise<TournamentRegistration[]> {
    const snapshot = await this.db.collection("registrations").get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TournamentRegistration));
  }

  async getTournamentRegistrations(tournamentId: string): Promise<TournamentRegistration[]> {
    const snapshot = await this.db.collection("registrations")
      .where("tournamentId", "==", tournamentId)
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TournamentRegistration));
  }

  async createRegistration(insertRegistration: InsertTournamentRegistration): Promise<TournamentRegistration> {
    const now = new Date().toISOString();

    const registrationData: Omit<TournamentRegistration, "id"> = {
      ...insertRegistration,
      paymentStatus: insertRegistration.paymentStatus || "pending",
      registeredAt: now,
    };

    const docRef = await this.db.collection("registrations").add(registrationData);
    return { id: docRef.id, ...registrationData };
  }

  async updateRegistration(id: string, updates: Partial<TournamentRegistration>): Promise<void> {
    await this.db.collection("registrations").doc(id).update(updates);
  }

  // ============================================================================
  // MATCH OPERATIONS
  // ============================================================================

  async getMatch(id: string): Promise<Match | undefined> {
    const doc = await this.db.collection("matches").doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } as Match : undefined;
  }

  async getTournamentMatches(tournamentId: string): Promise<Match[]> {
    const snapshot = await this.db.collection("matches")
      .where("tournamentId", "==", tournamentId)
      .orderBy("roundNumber")
      .orderBy("matchNumber")
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
  }

  async getAllMatches(): Promise<Match[]> {
    const snapshot = await this.db.collection("matches").get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const now = new Date().toISOString();

    const matchData: Omit<Match, "id"> = {
      ...insertMatch,
      player1Validated: insertMatch.player1Validated ?? false,
      player2Validated: insertMatch.player2Validated ?? false,
      status: insertMatch.status || "pending",
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await this.db.collection("matches").add(matchData);
    return { id: docRef.id, ...matchData };
  }

  async updateMatch(id: string, updates: Partial<Match>): Promise<void> {
    await this.db.collection("matches").doc(id).update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  async updateMatchAndRatings(matchId: string, updates: Partial<Match>, match: Match): Promise<void> {
    // Start a Firestore transaction for atomic updates
    await this.db.runTransaction(async (transaction) => {
      // Update match
      const matchRef = this.db.collection("matches").doc(matchId);
      transaction.update(matchRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });

      // Calculate rating changes (ELO system)
      if (match.player1Id && match.player2Id && updates.winnerId) {
        const player1Doc = await transaction.get(this.db.collection("users").doc(match.player1Id));
        const player2Doc = await transaction.get(this.db.collection("users").doc(match.player2Id));

        if (player1Doc.exists && player2Doc.exists) {
          const player1 = { id: player1Doc.id, ...player1Doc.data() } as User;
          const player2 = { id: player2Doc.id, ...player2Doc.data() } as User;

          const K = 32; // K-factor
          const player1Won = updates.winnerId === match.player1Id;

          // Expected scores
          const expectedPlayer1 = 1 / (1 + Math.pow(10, (player2.rating - player1.rating) / 400));
          const expectedPlayer2 = 1 - expectedPlayer1;

          // Actual scores
          const actualPlayer1 = player1Won ? 1 : 0;
          const actualPlayer2 = player1Won ? 0 : 1;

          // Rating changes
          const player1Change = Math.round(K * (actualPlayer1 - expectedPlayer1));
          const player2Change = Math.round(K * (actualPlayer2 - expectedPlayer2));

          // Update ratings
          const newPlayer1Rating = player1.rating + player1Change;
          const newPlayer2Rating = player2.rating + player2Change;

          transaction.update(this.db.collection("users").doc(match.player1Id), {
            rating: newPlayer1Rating,
            updatedAt: new Date().toISOString(),
          });

          transaction.update(this.db.collection("users").doc(match.player2Id), {
            rating: newPlayer2Rating,
            updatedAt: new Date().toISOString(),
          });

          // Record rating history
          const now = new Date().toISOString();

          transaction.set(this.db.collection("ratingHistory").doc(), {
            playerId: match.player1Id,
            matchId: matchId,
            previousRating: player1.rating,
            newRating: newPlayer1Rating,
            ratingChange: player1Change,
            createdAt: now,
          });

          transaction.set(this.db.collection("ratingHistory").doc(), {
            playerId: match.player2Id,
            matchId: matchId,
            previousRating: player2.rating,
            newRating: newPlayer2Rating,
            ratingChange: player2Change,
            createdAt: now,
          });
        }
      }
    });
  }

  // ============================================================================
  // RATING OPERATIONS
  // ============================================================================

  async getPlayerRatingHistory(playerId: string): Promise<RatingHistory[]> {
    const snapshot = await this.db.collection("ratingHistory")
      .where("playerId", "==", playerId)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RatingHistory));
  }

  async createRatingHistory(insertHistory: InsertRatingHistory): Promise<RatingHistory> {
    const now = new Date().toISOString();

    const historyData: Omit<RatingHistory, "id"> = {
      ...insertHistory,
      createdAt: now,
    };

    const docRef = await this.db.collection("ratingHistory").add(historyData);
    return { id: docRef.id, ...historyData };
  }

  // ============================================================================
  // RANKINGS
  // ============================================================================

  async getTopPlayers(limit: number = 100): Promise<User[]> {
    const snapshot = await this.db.collection("users")
      .where("role", "==", "jugador")
      .orderBy("rating", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  }

  // ============================================================================
  // UTILITY
  // ============================================================================

  async generateMemberNumber(): Promise<string> {
    const counterRef = this.db.collection("counters").doc("memberNumber");

    const newNumber = await this.db.runTransaction(async (transaction) => {
      const doc = await transaction.get(counterRef);

      let currentNumber = 1;
      if (doc.exists) {
        currentNumber = (doc.data()?.value || 0) + 1;
      }

      transaction.set(counterRef, { value: currentNumber });
      return currentNumber;
    });

    return `PRTTM-${newNumber.toString().padStart(6, "0")}`;
  }

  async generateTournamentDraw(tournamentId: string): Promise<Match[]> {
    const registrations = await this.getTournamentRegistrations(tournamentId);
    const tournament = await this.getTournament(tournamentId);

    if (!tournament) {
      throw new Error("Tournament not found");
    }

    // Get all registered players with verified payment
    const playerIds = registrations
      .filter((reg) => reg.paymentStatus === "verified")
      .map((reg) => reg.playerId);

    // Shuffle players (simple random draw)
    const shuffled = playerIds.sort(() => Math.random() - 0.5);

    // Create first round matches
    const matches: Match[] = [];
    const numMatches = Math.floor(shuffled.length / 2);

    for (let i = 0; i < numMatches; i++) {
      const match = await this.createMatch({
        tournamentId,
        roundNumber: 1,
        matchNumber: i + 1,
        player1Id: shuffled[i * 2],
        player2Id: shuffled[i * 2 + 1],
        status: "pending",
        player1Validated: false,
        player2Validated: false,
      });
      matches.push(match);
    }

    return matches;
  }
}

// Export singleton instance
export const storage = new FirestoreStorage();
