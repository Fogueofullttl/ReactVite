import { storage } from "./storage";

export async function seedData() {
  console.log("Iniciando carga de datos de ejemplo...");

  // Create sample users (players)
  const users = await Promise.all([
    storage.createUser({
      firebaseUid: "mock-firebase-uid-1",
      email: "carlos.rivera@example.com",
      name: "Carlos Rivera",
      birthYear: 1990,
      club: "San Juan TT",
      photoUrl: null,
      role: "jugador",
      membershipStatus: "active",
      membershipExpiresAt: "2025-12-31",
    }),
    storage.createUser({
      firebaseUid: "mock-firebase-uid-2",
      email: "maria.gonzalez@example.com",
      name: "María González",
      birthYear: 1995,
      club: "Club Ponce",
      photoUrl: null,
      role: "jugador",
      membershipStatus: "active",
      membershipExpiresAt: "2025-12-31",
    }),
    storage.createUser({
      firebaseUid: "mock-firebase-uid-3",
      email: "jose.martinez@example.com",
      name: "José Martínez",
      birthYear: 1988,
      club: "Mayagüez TT",
      photoUrl: null,
      role: "jugador",
      membershipStatus: "active",
      membershipExpiresAt: "2025-12-31",
    }),
    storage.createUser({
      firebaseUid: "mock-firebase-uid-4",
      email: "ana.rodriguez@example.com",
      name: "Ana Rodríguez",
      birthYear: 1992,
      club: "Caguas TT",
      photoUrl: null,
      role: "jugador",
      membershipStatus: "active",
      membershipExpiresAt: "2025-12-31",
    }),
    storage.createUser({
      firebaseUid: "mock-firebase-uid-5",
      email: "luis.torres@example.com",
      name: "Luis Torres",
      birthYear: 1987,
      club: "San Juan TT",
      photoUrl: null,
      role: "jugador",
      membershipStatus: "active",
      membershipExpiresAt: "2025-12-31",
    }),
  ]);

  // Update ratings manually
  await storage.updateUser(users[0].id, { rating: 1850 });
  await storage.updateUser(users[1].id, { rating: 1820 });
  await storage.updateUser(users[2].id, { rating: 1795 });
  await storage.updateUser(users[3].id, { rating: 1770 });
  await storage.updateUser(users[4].id, { rating: 1745 });

  // Create sample tournaments
  const tournaments = await Promise.all([
    storage.createTournament({
      name: "Abierto de Puerto Rico 2025",
      type: "singles",
      genderCategory: "mixed",
      events: ["Singles Masculino", "Singles Femenino", "Dobles Mixtos"],
      registrationDeadline: "2025-01-10",
      startDate: "2025-01-15",
      endDate: "2025-01-17",
      venue: "Centro de Convenciones, San Juan",
      entryFee: 50,
      maxParticipants: 64,
      status: "registration_open",
      createdBy: users[0].id,
    }),
    storage.createTournament({
      name: "Campeonato de Dobles",
      type: "doubles",
      genderCategory: "mixed",
      events: ["Dobles Masculino", "Dobles Femenino", "Dobles Mixtos"],
      registrationDeadline: "2025-02-01",
      startDate: "2025-02-05",
      endDate: "2025-02-06",
      venue: "Coliseo Municipal, Ponce",
      entryFee: 40,
      maxParticipants: 32,
      status: "registration_open",
      createdBy: users[0].id,
    }),
    storage.createTournament({
      name: "Invitacional Femenino",
      type: "singles",
      genderCategory: "female",
      events: ["Singles Femenino"],
      registrationDeadline: "2025-02-15",
      startDate: "2025-02-20",
      endDate: "2025-02-20",
      venue: "Club Deportivo, Mayagüez",
      entryFee: 30,
      maxParticipants: 24,
      status: "upcoming",
      createdBy: users[1].id,
    }),
  ]);

  // Create sample matches for arbitro
  const matches = await Promise.all([
    storage.createMatch({
      tournamentId: tournaments[0].id,
      roundNumber: 1,
      matchNumber: 1,
      player1Id: users[0].id,
      player2Id: users[1].id,
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
    }),
    storage.createMatch({
      tournamentId: tournaments[0].id,
      roundNumber: 1,
      matchNumber: 2,
      player1Id: users[2].id,
      player2Id: users[3].id,
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
    }),
  ]);

  // Create sample tournament registrations
  const registrations = await Promise.all([
    storage.createRegistration({
      tournamentId: tournaments[0].id,
      playerId: users[0].id,
      partnerId: null,
      events: ["Singles Masculino", "Dobles Mixtos"],
      athMovilReference: "ABC12",
    }),
    storage.createRegistration({
      tournamentId: tournaments[0].id,
      playerId: users[1].id,
      partnerId: null,
      events: ["Singles Femenino"],
      athMovilReference: "XYZ99",
    }),
    storage.createRegistration({
      tournamentId: tournaments[1].id,
      playerId: users[2].id,
      partnerId: users[3].id,
      events: ["Dobles Masculino", "Dobles Mixtos"],
      athMovilReference: "D4E5F",
    }),
  ]);

  console.log("¡Base de datos cargada exitosamente!");
  console.log(`Creados ${users.length} usuarios, ${tournaments.length} torneos, ${matches.length} partidos, y ${registrations.length} registros`);
}
