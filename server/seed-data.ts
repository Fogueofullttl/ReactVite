import { storage } from "./storage";

export async function seedData() {
  console.log("Seeding database with sample data...");

  // Create sample users
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
      club: "Ponce Club",
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
  ]);

  // Update ratings manually
  await storage.updateUser(users[0].id, { rating: 1850 });
  await storage.updateUser(users[1].id, { rating: 1820 });
  await storage.updateUser(users[2].id, { rating: 1795 });

  // Create sample tournaments
  const tournament = await storage.createTournament({
    name: "Puerto Rico Open 2025",
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
  });

  console.log("Database seeded successfully!");
  console.log(`Created ${users.length} users and ${1} tournament`);
}
