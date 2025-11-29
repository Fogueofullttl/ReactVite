import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertTournamentSchema,
  insertTournamentRegistrationSchema,
  insertMatchSchema,
} from "@shared/schema";
import { ZodError } from "zod";
import { log } from "./app";
import { getAuth, getFirestore } from "./firebaseAdmin";

// Error handling helper
function handleError(error: unknown, defaultMessage: string): { status: number; message: string; details?: unknown } {
  if (error instanceof ZodError) {
    return {
      status: 400,
      message: "Validation error",
      details: error.errors
    };
  }

  if (error instanceof Error) {
    log(`Error: ${error.message}`, "routes");
    return {
      status: 500,
      message: error.message || defaultMessage
    };
  }

  log(`Unknown error: ${String(error)}`, "routes");
  return {
    status: 500,
    message: defaultMessage
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Firebase Admin health check
  app.get("/api/health/firebase", (req, res) => {
    try {
      const auth = getAuth();
      const firestore = getFirestore();
      res.json({
        status: "ok",
        firebaseAdmin: {
          auth: !!auth,
          firestore: !!firestore,
        }
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: error.message,
        firebaseAdmin: false
      });
    }
  });

  // User registration endpoint (uses Firebase Admin SDK)
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName, birthYear, club, photoURL } = req.body;

      // Validation
      if (!email || !password || !firstName || !lastName || !birthYear) {
        return res.status(400).json({
          error: "Missing required fields: email, password, firstName, lastName, birthYear"
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          error: "Password must be at least 6 characters"
        });
      }

      const auth = getAuth();
      const firestore = getFirestore();

      // Create user in Firebase Authentication
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: `${firstName} ${lastName}`,
        photoURL: photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}`,
      });

      // Generate member number using Firestore transaction
      const counterRef = firestore.collection('counters').doc('memberNumbers');

      const memberNumber = await firestore.runTransaction(async (transaction) => {
        const counterDoc = await transaction.get(counterRef);

        let current = 0;
        if (counterDoc.exists) {
          current = counterDoc.data()?.current || 0;
        }

        const next = current + 1;
        transaction.set(counterRef, { current: next });

        return `PRTTM-${next.toString().padStart(6, '0')}`;
      });

      // Create user profile in Firestore
      const now = new Date();
      const userProfile = {
        uid: userRecord.uid,
        firebaseUid: userRecord.uid,
        email,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        displayName: `${firstName.trim()} ${lastName.trim()}`,
        memberNumber,
        birthYear: parseInt(birthYear),
        club: club?.trim() || "",
        role: 'jugador',
        rating: 1000,
        photoURL: userRecord.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}`,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      await firestore.collection('users').doc(userRecord.uid).set(userProfile);

      log(`User registered: ${email} (${memberNumber})`, "auth");

      res.status(201).json({
        success: true,
        user: {
          uid: userRecord.uid,
          email: userProfile.email,
          displayName: userProfile.displayName,
          memberNumber: userProfile.memberNumber,
          role: userProfile.role,
        },
      });
    } catch (error: any) {
      log(`Registration error: ${error.message}`, "auth");

      // Handle Firebase Auth errors
      if (error.code === 'auth/email-already-exists') {
        return res.status(400).json({ error: "Este correo electrónico ya está registrado" });
      } else if (error.code === 'auth/invalid-email') {
        return res.status(400).json({ error: "Correo electrónico inválido" });
      } else if (error.code === 'auth/weak-password') {
        return res.status(400).json({ error: "La contraseña es muy débil" });
      }

      const { status, message } = handleError(error, "Failed to register user");
      res.status(status).json({ error: message });
    }
  });

  // User login endpoint (uses Firebase REST API)
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          error: "Missing required fields: email, password"
        });
      }

      // Use Firebase REST API to verify credentials
      // This doesn't require API key restrictions
      const firebaseApiKey = process.env.VITE_FIREBASE_API_KEY || "AIzaSyBpcoGM3bQ9r7tfCUEqL_yhM0HUf3LHzt0";

      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
          }),
        }
      );

      const authData = await response.json();

      if (!response.ok) {
        log(`Login failed for ${email}: ${authData.error?.message}`, "auth");
        return res.status(401).json({
          error: authData.error?.message === 'EMAIL_NOT_FOUND' || authData.error?.message === 'INVALID_PASSWORD'
            ? "Email o contraseña incorrectos"
            : "Error al iniciar sesión"
        });
      }

      // Get user profile from Firestore
      const firestore = getFirestore();
      const userDoc = await firestore.collection('users').doc(authData.localId).get();

      if (!userDoc.exists) {
        return res.status(404).json({
          error: "Perfil de usuario no encontrado"
        });
      }

      const userProfile = userDoc.data();

      log(`User logged in: ${email}`, "auth");

      res.json({
        success: true,
        user: {
          uid: authData.localId,
          firebaseUid: authData.localId,
          email: userProfile?.email,
          name: userProfile?.displayName,
          role: userProfile?.role,
          memberNumber: userProfile?.memberNumber,
          birthYear: userProfile?.birthYear,
          rating: userProfile?.rating,
          photoURL: userProfile?.photoURL,
        },
        // Include the ID token for client-side session management
        idToken: authData.idToken,
        refreshToken: authData.refreshToken,
        expiresIn: authData.expiresIn,
      });
    } catch (error: any) {
      log(`Login error: ${error.message}`, "auth");
      const { status, message } = handleError(error, "Failed to login");
      res.status(status).json({ error: message });
    }
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
    } catch (error) {
      const { status, message, details } = handleError(error, "Failed to create user");
      res.status(status).json({ error: message, details });
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
    } catch (error) {
      const { status, message, details } = handleError(error, "Failed to create tournament");
      res.status(status).json({ error: message, details });
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
    } catch (error) {
      const { status, message, details } = handleError(error, "Failed to create registration");
      res.status(status).json({ error: message, details });
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

  // Register to tournament (convenience endpoint)
  app.post("/api/tournaments/:id/register", async (req, res) => {
    try {
      const playerId = req.body.playerId;

      if (!playerId) {
        return res.status(400).json({ error: "playerId is required" });
      }

      if (!req.body.events || !Array.isArray(req.body.events)) {
        return res.status(400).json({
          error: "Events is required and must be an array",
          received: req.body.events
        });
      }

      const validated = insertTournamentRegistrationSchema.parse({
        tournamentId: req.params.id,
        playerId: playerId,
        partnerId: req.body.partnerId,
        events: req.body.events,
        athMovilReference: req.body.athMovilReference,
      });

      const registration = await storage.createRegistration(validated);
      res.status(201).json(registration);
    } catch (error) {
      const { status, message, details } = handleError(error, "Failed to register to tournament");
      res.status(status).json({ error: message, details });
    }
  });

  // Get all registrations (for admin)
  app.get("/api/registrations", async (req, res) => {
    try {
      const registrations = await storage.getAllRegistrations();
      
      // Populate registrations with player and tournament details
      const registrationsWithDetails = await Promise.all(
        registrations.map(async (registration) => {
          const [player, partner, tournament, verifier] = await Promise.all([
            storage.getUser(registration.playerId),
            registration.partnerId ? storage.getUser(registration.partnerId) : Promise.resolve(undefined),
            storage.getTournament(registration.tournamentId),
            registration.verifiedBy ? storage.getUser(registration.verifiedBy) : Promise.resolve(undefined),
          ]);

          return {
            ...registration,
            player,
            partner,
            tournament,
            verifiedBy: verifier,
          };
        })
      );

      res.json(registrationsWithDetails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch registrations" });
    }
  });

  // Verify/reject registration payment
  app.patch("/api/registrations/:id/verify", async (req, res) => {
    try {
      const { status, rejectionReason, adminId } = req.body;

      if (!["verified", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Status must be 'verified' or 'rejected'" });
      }

      if (!adminId) {
        return res.status(400).json({ error: "adminId is required" });
      }

      const updates: {
        paymentStatus: "verified" | "rejected";
        verifiedBy: string;
        verifiedAt: string;
        rejectionReason?: string;
      } = {
        paymentStatus: status,
        verifiedBy: adminId,
        verifiedAt: new Date().toISOString(),
      };

      if (status === "rejected" && rejectionReason) {
        updates.rejectionReason = rejectionReason;
      }

      await storage.updateRegistration(req.params.id, updates);
      res.json({ success: true });
    } catch (error) {
      const { status: errorStatus, message } = handleError(error, "Failed to verify registration");
      res.status(errorStatus).json({ error: message });
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

      const { winnerId, player1Score, player2Score } = req.body;

      if (!winnerId || player1Score === undefined || player2Score === undefined) {
        return res.status(400).json({ error: "winnerId, player1Score, and player2Score are required" });
      }

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
    } catch (error) {
      const { status, message } = handleError(error, "Failed to submit match result");
      res.status(status).json({ error: message });
    }
  });

  app.post("/api/matches", async (req, res) => {
    try {
      const validated = insertMatchSchema.parse(req.body);
      const match = await storage.createMatch(validated);
      res.status(201).json(match);
    } catch (error) {
      const { status, message, details } = handleError(error, "Failed to create match");
      res.status(status).json({ error: message, details });
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
