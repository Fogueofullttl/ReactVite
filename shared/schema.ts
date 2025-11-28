import { z } from "zod";

// ============================================================================
// ENUMS
// ============================================================================

export type UserRole = "owner" | "admin" | "arbitro" | "jugador" | "publico";
export type TournamentType = "singles" | "doubles";
export type GenderCategory = "male" | "female" | "mixed";
export type TournamentStatus = "upcoming" | "registration_open" | "in_progress" | "completed";
export type MatchStatus = "pending" | "in_progress" | "completed";
export type MembershipStatus = "active" | "expired" | "pending";
export type PaymentStatus = "pending" | "verified" | "rejected";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface User {
  id: string;
  firebaseUid: string;
  email: string;
  name: string;
  birthYear: number;
  club?: string;
  photoUrl?: string;
  memberNumber: string;
  role: UserRole;
  membershipStatus: MembershipStatus;
  membershipExpiresAt?: Date | string;
  rating: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Tournament {
  id: string;
  name: string;
  type: TournamentType;
  genderCategory: GenderCategory;
  events: string[];
  registrationDeadline: Date | string;
  startDate: Date | string;
  endDate?: Date | string;
  venue: string;
  entryFee: number;
  maxParticipants?: number;
  status: TournamentStatus;
  createdBy: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface TournamentRegistration {
  id: string;
  tournamentId: string;
  playerId: string;
  partnerId?: string;
  events: string[];
  athMovilReference: string;
  paymentStatus: PaymentStatus;
  verifiedBy?: string;
  verifiedAt?: Date | string;
  rejectionReason?: string;
  registeredAt: Date | string;
}

export interface Match {
  id: string;
  tournamentId: string;
  roundNumber: number;
  matchNumber: number;
  player1Id?: string;
  player2Id?: string;
  player1PartnerId?: string;
  player2PartnerId?: string;
  player1Score?: number;
  player2Score?: number;
  winnerId?: string;
  status: MatchStatus;
  scheduledAt?: Date | string;
  completedAt?: Date | string;
  refereeId?: string;
  player1Validated: boolean;
  player2Validated: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface RatingHistory {
  id: string;
  playerId: string;
  matchId: string;
  previousRating: number;
  newRating: number;
  ratingChange: number;
  createdAt: Date | string;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const insertUserSchema = z.object({
  firebaseUid: z.string(),
  email: z.string().email(),
  name: z.string().min(1),
  birthYear: z.number().int().min(1900).max(new Date().getFullYear()),
  club: z.string().optional(),
  photoUrl: z.string().url().optional(),
  role: z.enum(["owner", "admin", "arbitro", "jugador", "publico"]).default("jugador"),
  membershipStatus: z.enum(["active", "expired", "pending"]).default("pending"),
  membershipExpiresAt: z.date().optional(),
});

export const insertTournamentSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["singles", "doubles"]),
  genderCategory: z.enum(["male", "female", "mixed"]),
  events: z.array(z.string()).min(1),
  registrationDeadline: z.date(),
  startDate: z.date(),
  endDate: z.date().optional(),
  venue: z.string().min(1),
  entryFee: z.number().int().min(0).default(0),
  maxParticipants: z.number().int().positive().optional(),
  status: z.enum(["upcoming", "registration_open", "in_progress", "completed"]).default("upcoming"),
  createdBy: z.string(),
});

export const insertTournamentRegistrationSchema = z.object({
  tournamentId: z.string(),
  playerId: z.string(),
  partnerId: z.string().optional(),
  events: z.array(z.string()).min(1),
  athMovilReference: z.string().length(5),
  paymentStatus: z.enum(["pending", "verified", "rejected"]).default("pending"),
  verifiedBy: z.string().optional(),
  verifiedAt: z.date().optional(),
  rejectionReason: z.string().optional(),
});

export const insertMatchSchema = z.object({
  tournamentId: z.string(),
  roundNumber: z.number().int().positive(),
  matchNumber: z.number().int().positive(),
  player1Id: z.string().optional(),
  player2Id: z.string().optional(),
  player1PartnerId: z.string().optional(),
  player2PartnerId: z.string().optional(),
  player1Score: z.number().int().min(0).optional(),
  player2Score: z.number().int().min(0).optional(),
  winnerId: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed"]).default("pending"),
  scheduledAt: z.date().optional(),
  completedAt: z.date().optional(),
  refereeId: z.string().optional(),
  player1Validated: z.boolean().default(false),
  player2Validated: z.boolean().default(false),
});

export const insertRatingHistorySchema = z.object({
  playerId: z.string(),
  matchId: z.string(),
  previousRating: z.number().int(),
  newRating: z.number().int(),
  ratingChange: z.number().int(),
});

// ============================================================================
// INSERT TYPES
// ============================================================================

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type InsertTournamentRegistration = z.infer<typeof insertTournamentRegistrationSchema>;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type InsertRatingHistory = z.infer<typeof insertRatingHistorySchema>;
