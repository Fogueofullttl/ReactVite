import { app } from "../server/app";
import { registerRoutes } from "../server/routes";
import { initializeFirebaseAdmin } from "../server/firebaseAdmin";

// Initialize once
let initialized = false;
async function initializeApp() {
  if (!initialized) {
    // Initialize Firebase Admin
    try {
      initializeFirebaseAdmin();
      console.log("Firebase Admin SDK initialized");
    } catch (error) {
      console.error("Firebase Admin initialization failed:", error);
    }

    // Register API routes (ignore the returned server, we don't need it for serverless)
    await registerRoutes(app);

    initialized = true;
    console.log("Serverless function initialized successfully");
  }
}

// Export as Vercel serverless handler
export default async function handler(req: any, res: any) {
  await initializeApp();
  return app(req, res);
}
