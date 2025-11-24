import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertTournamentSchema,
  insertTournamentRegistrationSchema,
  insertMatchSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const validated = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validated);
      res.status(201).json(user);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.get("/api/users/by-firebase-uid/:firebaseUid", async (req, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.params.firebaseUid);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      await storage.updateUser(req.params.id, req.body);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Tournament routes
  app.get("/api/tournaments", async (req, res) => {
    try {
      const tournaments = await storage.getAllTournaments();
      res.json(tournaments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tournaments" });
    }
  });

  app.get("/api/tournaments/:id", async (req, res) => {
    try {
      const tournament = await storage.getTournament(req.params.id);
      if (!tournament) {
        return res.status(404).json({ error: "Tournament not found" });
      }
      res.json(tournament);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tournament" });
    }
  });

  app.post("/api/tournaments", async (req, res) => {
    try {
      const validated = insertTournamentSchema.parse(req.body);
      const tournament = await storage.createTournament(validated);
      res.status(201).json(tournament);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create tournament" });
    }
  });

  app.patch("/api/tournaments/:id", async (req, res) => {
    try {
      await storage.updateTournament(req.params.id, req.body);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update tournament" });
    }
  });

  // Tournament Registration routes
  app.get("/api/tournaments/:tournamentId/registrations", async (req, res) => {
    try {
      const registrations = await storage.getTournamentRegistrations(req.params.tournamentId);
      res.json(registrations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch registrations" });
    }
  });

  app.post("/api/registrations", async (req, res) => {
    try {
      const validated = insertTournamentRegistrationSchema.parse(req.body);
      const registration = await storage.createRegistration(validated);
      res.status(201).json(registration);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create registration" });
    }
  });

  app.patch("/api/registrations/:id", async (req, res) => {
    try {
      await storage.updateRegistration(req.params.id, req.body);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update registration" });
    }
  });

  // Match routes
  app.get("/api/tournaments/:tournamentId/matches", async (req, res) => {
    try {
      const matches = await storage.getTournamentMatches(req.params.tournamentId);
      res.json(matches);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch matches" });
    }
  });

  // Get matches for arbitro - MUST BE BEFORE /api/matches/:id
  app.get("/api/matches/arbitro", async (req, res) => {
    try {
      const allMatches = await storage.getAllMatches();
      
      // Populate matches with player and tournament details
      const matchesWithDetails = await Promise.all(
        allMatches.map(async (match) => {
          const [player1, player2, player1Partner, player2Partner, tournament] = await Promise.all([
            match.player1Id ? storage.getUser(match.player1Id) : Promise.resolve(undefined),
            match.player2Id ? storage.getUser(match.player2Id) : Promise.resolve(undefined),
            match.player1PartnerId ? storage.getUser(match.player1PartnerId) : Promise.resolve(undefined),
            match.player2PartnerId ? storage.getUser(match.player2PartnerId) : Promise.resolve(undefined),
            storage.getTournament(match.tournamentId),
          ]);

          return {
            ...match,
            player1,
            player2,
            player1Partner,
            player2Partner,
            tournament,
          };
        })
      );

      res.json(matchesWithDetails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch matches" });
    }
  });

  app.get("/api/matches/:id", async (req, res) => {
    try {
      const match = await storage.getMatch(req.params.id);
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }

      // Populate match with player and tournament details
      const [player1, player2, player1Partner, player2Partner, tournament] = await Promise.all([
        match.player1Id ? storage.getUser(match.player1Id) : Promise.resolve(undefined),
        match.player2Id ? storage.getUser(match.player2Id) : Promise.resolve(undefined),
        match.player1PartnerId ? storage.getUser(match.player1PartnerId) : Promise.resolve(undefined),
        match.player2PartnerId ? storage.getUser(match.player2PartnerId) : Promise.resolve(undefined),
        storage.getTournament(match.tournamentId),
      ]);

      res.json({
        ...match,
        player1,
        player2,
        player1Partner,
        player2Partner,
        tournament,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch match" });
    }
  });

  // Submit match result with rating calculation
  app.post("/api/matches/:id/result", async (req, res) => {
    try {
      const match = await storage.getMatch(req.params.id);
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }

      const { sets, winnerId, player1Score, player2Score, observations } = req.body;

      // Update match with result
      const updates = {
        player1Score,
        player2Score,
        winnerId,
        status: "completed" as const,
        completedAt: new Date().toISOString(),
      };

      // Calculate and update ratings
      await storage.updateMatchAndRatings(req.params.id, updates, match);

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error submitting match result:", error);
      res.status(500).json({ error: error.message || "Failed to submit match result" });
    }
  });

  app.post("/api/matches", async (req, res) => {
    try {
      const validated = insertMatchSchema.parse(req.body);
      const match = await storage.createMatch(validated);
      res.status(201).json(match);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create match" });
    }
  });

  app.patch("/api/matches/:id", async (req, res) => {
    try {
      const updates = req.body;
      
      // If match is being completed, calculate rating changes
      if (updates.status === "completed" && updates.winnerId) {
        const match = await storage.getMatch(req.params.id);
        if (match) {
          await storage.updateMatchAndRatings(req.params.id, updates, match);
        }
      } else {
        await storage.updateMatch(req.params.id, updates);
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update match" });
    }
  });

  // Rating History routes
  app.get("/api/users/:playerId/rating-history", async (req, res) => {
    try {
      const history = await storage.getPlayerRatingHistory(req.params.playerId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rating history" });
    }
  });

  // Rankings routes
  app.get("/api/rankings", async (req, res) => {
    try {
      const limitParam = req.query.limit as string;
      const limit = limitParam ? parseInt(limitParam) : 100;
      const players = await storage.getTopPlayers(limit);
      res.json(players);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rankings" });
    }
  });

  // Member number generation
  app.get("/api/generate-member-number", async (req, res) => {
    try {
      const memberNumber = await storage.generateMemberNumber();
      res.json({ memberNumber });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate member number" });
    }
  });

  // Tournament draw generation
  app.post("/api/tournaments/:id/generate-draw", async (req, res) => {
    try {
      const matches = await storage.generateTournamentDraw(req.params.id);
      res.json({ matches });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate draw" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
