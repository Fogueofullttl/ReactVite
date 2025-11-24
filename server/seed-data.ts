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
      role: "player",
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
      role: "player",
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
      role: "player",
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
      role: "player",
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
      role: "player",
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

  console.log("¡Base de datos cargada exitosamente!");
  console.log(`Creados ${users.length} usuarios y ${tournaments.length} torneos`);
}
