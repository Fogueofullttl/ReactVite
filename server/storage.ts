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
import { randomUUID } from "crypto";

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

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private tournaments: Map<string, Tournament>;
  private registrations: Map<string, TournamentRegistration>;
  private matches: Map<string, Match>;
  private ratingHistory: Map<string, RatingHistory>;
  private memberNumberCounter: number;

  constructor() {
    this.users = new Map();
    this.tournaments = new Map();
    this.registrations = new Map();
    this.matches = new Map();
    this.ratingHistory = new Map();
    this.memberNumberCounter = 1;
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.firebaseUid === firebaseUid
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const memberNumber = await this.generateMemberNumber();
    const now = new Date().toISOString();
    
    const user: User = {
      ...insertUser,
      id,
      memberNumber,
      rating: 1000,
      createdAt: now,
      updatedAt: now,
    };
    
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      this.users.set(id, { ...user, ...updates, updatedAt: new Date().toISOString() });
    }
  }

  // Tournament operations
  async getTournament(id: string): Promise<Tournament | undefined> {
    return this.tournaments.get(id);
  }

  async getAllTournaments(): Promise<Tournament[]> {
    return Array.from(this.tournaments.values());
  }

  async createTournament(insertTournament: InsertTournament): Promise<Tournament> {
    const id = randomUUID();
    const now = new Date().toISOString();
    
    const tournament: Tournament = {
      ...insertTournament,
      id,
      createdAt: now,
      updatedAt: now,
    };
    
    this.tournaments.set(id, tournament);
    return tournament;
  }

  async updateTournament(id: string, updates: Partial<Tournament>): Promise<void> {
    const tournament = this.tournaments.get(id);
    if (tournament) {
      this.tournaments.set(id, { ...tournament, ...updates, updatedAt: new Date().toISOString() });
    }
  }

  // Registration operations
  async getRegistration(id: string): Promise<TournamentRegistration | undefined> {
    return this.registrations.get(id);
  }

  async getAllRegistrations(): Promise<TournamentRegistration[]> {
    return Array.from(this.registrations.values());
  }

  async getTournamentRegistrations(tournamentId: string): Promise<TournamentRegistration[]> {
    return Array.from(this.registrations.values()).filter(
      (reg) => reg.tournamentId === tournamentId
    );
  }

  async createRegistration(insertRegistration: InsertTournamentRegistration): Promise<TournamentRegistration> {
    const id = randomUUID();
    const now = new Date().toISOString();
    
    const registration: TournamentRegistration = {
      ...insertRegistration,
      id,
      paymentStatus: "pending",
      verifiedBy: null,
      verifiedAt: null,
      rejectionReason: null,
      registeredAt: now,
    };
    
    this.registrations.set(id, registration);
    return registration;
  }

  async updateRegistration(id: string, updates: Partial<TournamentRegistration>): Promise<void> {
    const registration = this.registrations.get(id);
    if (registration) {
      this.registrations.set(id, { ...registration, ...updates });
    }
  }

  // Match operations
  async getMatch(id: string): Promise<Match | undefined> {
    return this.matches.get(id);
  }

  async getTournamentMatches(tournamentId: string): Promise<Match[]> {
    return Array.from(this.matches.values())
      .filter((match) => match.tournamentId === tournamentId)
      .sort((a, b) => {
        if (a.roundNumber !== b.roundNumber) {
          return a.roundNumber - b.roundNumber;
        }
        return a.matchNumber - b.matchNumber;
      });
  }

  async getAllMatches(): Promise<Match[]> {
    return Array.from(this.matches.values());
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const id = randomUUID();
    const now = new Date().toISOString();
    
    const match: Match = {
      ...insertMatch,
      id,
      createdAt: now,
      updatedAt: now,
    };
    
    this.matches.set(id, match);
    return match;
  }

  async updateMatch(id: string, updates: Partial<Match>): Promise<void> {
    const match = this.matches.get(id);
    if (match) {
      this.matches.set(id, { ...match, ...updates, updatedAt: new Date().toISOString() });
    }
  }

  async updateMatchAndRatings(matchId: string, updates: Partial<Match>, match: Match): Promise<void> {
    // Update match
    await this.updateMatch(matchId, updates);

    // Calculate rating changes (simple ELO-like system)
    if (match.player1Id && match.player2Id && updates.winnerId) {
      const player1 = await this.getUser(match.player1Id);
      const player2 = await this.getUser(match.player2Id);

      if (player1 && player2) {
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

        await this.updateUser(match.player1Id, { rating: newPlayer1Rating });
        await this.updateUser(match.player2Id, { rating: newPlayer2Rating });

        // Record rating history
        await this.createRatingHistory({
          playerId: match.player1Id,
          matchId: matchId,
          previousRating: player1.rating,
          newRating: newPlayer1Rating,
          ratingChange: player1Change,
        });

        await this.createRatingHistory({
          playerId: match.player2Id,
          matchId: matchId,
          previousRating: player2.rating,
          newRating: newPlayer2Rating,
          ratingChange: player2Change,
        });
      }
    }
  }

  // Rating operations
  async getPlayerRatingHistory(playerId: string): Promise<RatingHistory[]> {
    return Array.from(this.ratingHistory.values())
      .filter((history) => history.playerId === playerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50);
  }

  async createRatingHistory(insertHistory: InsertRatingHistory): Promise<RatingHistory> {
    const id = randomUUID();
    const now = new Date().toISOString();
    
    const history: RatingHistory = {
      ...insertHistory,
      id,
      createdAt: now,
    };
    
    this.ratingHistory.set(id, history);
    return history;
  }

  // Rankings
  async getTopPlayers(limit: number = 100): Promise<User[]> {
    return Array.from(this.users.values())
      .filter((user) => user.role === "jugador")
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  // Utility
  async generateMemberNumber(): Promise<string> {
    const number = this.memberNumberCounter++;
    return `PRTTM-${number.toString().padStart(6, "0")}`;
  }

  async generateTournamentDraw(tournamentId: string): Promise<Match[]> {
    const registrations = await this.getTournamentRegistrations(tournamentId);
    const tournament = await this.getTournament(tournamentId);
    
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    // Get all registered players
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
        player1Id: shuffled[i * 2] || null,
        player2Id: shuffled[i * 2 + 1] || null,
        player1PartnerId: null,
        player2PartnerId: null,
        player1Score: null,
        player2Score: null,
        winnerId: null,
        status: "pending",
        scheduledAt: null,
        completedAt: null,
        refereeId: null,
        player1Validated: false,
        player2Validated: false,
      });
      matches.push(match);
    }

    return matches;
  }
}

export const storage = new MemStorage();
