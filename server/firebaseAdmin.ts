import admin from "firebase-admin";
import { readFileSync } from "fs";
import { resolve } from "path";

let firebaseAdmin: admin.app.App | null = null;

export function initializeFirebaseAdmin(): admin.app.App {
  if (firebaseAdmin) {
    return firebaseAdmin;
  }

  try {
    // Try to load from service account file
    const serviceAccountPath = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH ||
                                resolve(process.cwd(), "firebase-admin-key.json");

    try {
      const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
      firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("✓ Firebase Admin initialized with service account file");
    } catch (fileError) {
      // Try to load from environment variable (for deployment)
      if (process.env.FIREBASE_ADMIN_CREDENTIALS) {
        const credentials = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);
        firebaseAdmin = admin.initializeApp({
          credential: admin.credential.cert(credentials),
        });
        console.log("✓ Firebase Admin initialized with environment credentials");
      } else {
        // Use Application Default Credentials (for local development with gcloud)
        firebaseAdmin = admin.initializeApp({
          credential: admin.credential.applicationDefault(),
        });
        console.log("✓ Firebase Admin initialized with application default credentials");
      }
    }

    return firebaseAdmin;
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
    throw new Error("Firebase Admin initialization failed. Please check your credentials.");
  }
}

export function getFirebaseAdmin(): admin.app.App {
  if (!firebaseAdmin) {
    return initializeFirebaseAdmin();
  }
  return firebaseAdmin;
}

export function getFirestore(): admin.firestore.Firestore {
  return getFirebaseAdmin().firestore();
}

export function getAuth(): admin.auth.Auth {
  return getFirebaseAdmin().auth();
}
