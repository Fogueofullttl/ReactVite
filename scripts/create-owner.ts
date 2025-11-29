/**
 * Script to create the initial owner user in Firebase
 *
 * Usage:
 *   npx tsx scripts/create-owner.ts
 *
 * This creates a user in both Firebase Authentication and Firestore
 * with the 'owner' role and proper synchronization.
 */

import admin from "firebase-admin";
import { readFileSync } from "fs";
import { resolve } from "path";

async function createOwnerUser() {
  try {
    // Initialize Firebase Admin
    const serviceAccountPath = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH ||
                                resolve(process.cwd(), "firebase-admin-key.json");

    let firebaseAdmin: admin.app.App;

    try {
      const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
      firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("✓ Firebase Admin initialized");
    } catch (fileError) {
      // Try environment variable
      if (process.env.FIREBASE_ADMIN_CREDENTIALS) {
        const credentials = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);
        firebaseAdmin = admin.initializeApp({
          credential: admin.credential.cert(credentials),
        });
        console.log("✓ Firebase Admin initialized from environment");
      } else {
        throw new Error("Could not find Firebase Admin credentials");
      }
    }

    const auth = firebaseAdmin.auth();
    const firestore = firebaseAdmin.firestore();

    // Owner details
    const ownerData = {
      email: "fogueofullttl@gmail.com",
      password: "Jveg335009@",
      firstName: "Owner",
      lastName: "Admin",
      birthYear: 1980,
      memberNumber: "PRTTM-000001", // Special member number for owner
    };

    console.log(`\nCreating owner user: ${ownerData.email}`);

    // Check if user already exists in Firebase Auth
    let userRecord: admin.auth.UserRecord;
    try {
      userRecord = await auth.getUserByEmail(ownerData.email);
      console.log(`✓ User already exists in Firebase Auth with UID: ${userRecord.uid}`);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // Create new user in Firebase Auth
        userRecord = await auth.createUser({
          email: ownerData.email,
          password: ownerData.password,
          displayName: `${ownerData.firstName} ${ownerData.lastName}`,
        });
        console.log(`✓ Created user in Firebase Auth with UID: ${userRecord.uid}`);
      } else {
        throw error;
      }
    }

    // Create/update user profile in Firestore
    const userRef = firestore.collection('users').doc(userRecord.uid);
    const existingDoc = await userRef.get();

    if (existingDoc.exists) {
      // Update existing profile to ensure it has owner role
      await userRef.update({
        role: 'owner',
        updatedAt: new Date().toISOString(),
      });
      console.log(`✓ Updated existing Firestore profile to owner role`);
    } else {
      // Create new profile
      const now = new Date();
      const userProfile = {
        uid: userRecord.uid,
        firebaseUid: userRecord.uid,
        email: ownerData.email,
        firstName: ownerData.firstName,
        lastName: ownerData.lastName,
        displayName: `${ownerData.firstName} ${ownerData.lastName}`,
        memberNumber: ownerData.memberNumber,
        birthYear: ownerData.birthYear,
        club: "FPTM",
        role: 'owner',
        rating: 1500,
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${ownerData.firstName}`,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      await userRef.set(userProfile);
      console.log(`✓ Created Firestore profile with owner role`);
    }

    // Initialize the member number counter if it doesn't exist
    const counterRef = firestore.collection('counters').doc('memberNumbers');
    const counterDoc = await counterRef.get();

    if (!counterDoc.exists) {
      await counterRef.set({ current: 1 });
      console.log(`✓ Initialized member number counter`);
    } else {
      console.log(`✓ Member number counter already exists`);
    }

    console.log("\n✅ Owner user created successfully!");
    console.log(`   Email: ${ownerData.email}`);
    console.log(`   Password: ${ownerData.password}`);
    console.log(`   UID: ${userRecord.uid}`);
    console.log(`   Member Number: ${ownerData.memberNumber}`);
    console.log(`   Role: owner`);
    console.log("\nYou can now login with these credentials.");

    await firebaseAdmin.delete();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error creating owner user:", error);
    process.exit(1);
  }
}

createOwnerUser();
