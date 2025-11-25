import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["owner", "admin", "arbitro", "jugador", "publico"]);
export const tournamentTypeEnum = pgEnum("tournament_type", ["singles", "doubles"]);
export const genderCategoryEnum = pgEnum("gender_category", ["male", "female", "mixed"]);
export const tournamentStatusEnum = pgEnum("tournament_status", ["upcoming", "registration_open", "in_progress", "completed"]);
export const matchStatusEnum = pgEnum("match_status", ["pending", "in_progress", "completed"]);
export const membershipStatusEnum = pgEnum("membership_status", ["active", "expired", "pending"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "verified", "rejected"]);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firebaseUid: varchar("firebase_uid").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  birthYear: integer("birth_year").notNull(),
  club: text("club"),
  photoUrl: text("photo_url"),
  memberNumber: varchar("member_number", { length: 15 }).notNull().unique(),
  role: userRoleEnum("role").notNull().default("jugador"),
  membershipStatus: membershipStatusEnum("membership_status").notNull().default("pending"),
  membershipExpiresAt: timestamp("membership_expires_at"),
  rating: integer("rating").notNull().default(1000),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Tournaments table
export const tournaments = pgTable("tournaments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: tournamentTypeEnum("type").notNull(),
  genderCategory: genderCategoryEnum("gender_category").notNull(),
  events: text("events").array().notNull(),
  registrationDeadline: timestamp("registration_deadline").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  venue: text("venue").notNull(),
  entryFee: integer("entry_fee").notNull().default(0),
  maxParticipants: integer("max_participants"),
  status: tournamentStatusEnum("status").notNull().default("upcoming"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Tournament Registrations table
export const tournamentRegistrations = pgTable("tournament_registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  playerId: varchar("player_id").notNull().references(() => users.id),
  partnerId: varchar("partner_id").references(() => users.id),
  events: text("events").array().notNull(),
  athMovilReference: varchar("ath_movil_reference", { length: 5 }).notNull(),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
  verifiedBy: varchar("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  rejectionReason: text("rejection_reason"),
  registeredAt: timestamp("registered_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Matches table
export const matches = pgTable("matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  roundNumber: integer("round_number").notNull(),
  matchNumber: integer("match_number").notNull(),
  player1Id: varchar("player1_id").references(() => users.id),
  player2Id: varchar("player2_id").references(() => users.id),
  player1PartnerId: varchar("player1_partner_id").references(() => users.id),
  player2PartnerId: varchar("player2_partner_id").references(() => users.id),
  player1Score: integer("player1_score"),
  player2Score: integer("player2_score"),
  winnerId: varchar("winner_id").references(() => users.id),
  status: matchStatusEnum("status").notNull().default("pending"),
  scheduledAt: timestamp("scheduled_at"),
  completedAt: timestamp("completed_at"),
  refereeId: varchar("referee_id").references(() => users.id),
  player1Validated: boolean("player1_validated").notNull().default(false),
  player2Validated: boolean("player2_validated").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Rating History table
export const ratingHistory = pgTable("rating_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playerId: varchar("player_id").notNull().references(() => users.id),
  matchId: varchar("match_id").notNull().references(() => matches.id),
  previousRating: integer("previous_rating").notNull(),
  newRating: integer("new_rating").notNull(),
  ratingChange: integer("rating_change").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  memberNumber: true,
  rating: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTournamentSchema = createInsertSchema(tournaments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTournamentRegistrationSchema = createInsertSchema(tournamentRegistrations).omit({
  id: true,
  registeredAt: true,
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRatingHistorySchema = createInsertSchema(ratingHistory).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type Tournament = typeof tournaments.$inferSelect;

export type InsertTournamentRegistration = z.infer<typeof insertTournamentRegistrationSchema>;
export type TournamentRegistration = typeof tournamentRegistrations.$inferSelect;

export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matches.$inferSelect;

export type InsertRatingHistory = z.infer<typeof insertRatingHistorySchema>;
export type RatingHistory = typeof ratingHistory.$inferSelect;

// Enums for frontend use
export type UserRole = "owner" | "admin" | "arbitro" | "jugador" | "publico";
export type TournamentType = "singles" | "doubles";
export type GenderCategory = "male" | "female" | "mixed";
export type TournamentStatus = "upcoming" | "registration_open" | "in_progress" | "completed";
export type MatchStatus = "pending" | "in_progress" | "completed";
export type MembershipStatus = "active" | "expired" | "pending";
export type PaymentStatus = "pending" | "verified" | "rejected";
