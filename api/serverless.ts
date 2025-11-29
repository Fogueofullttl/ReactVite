import { app } from "../server/app";
import { registerRoutes } from "../server/routes";
import { initializeFirebaseAdmin } from "../server/firebaseAdmin";
import path from "path";
import fs from "fs";
import express from "express";

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

    // Register API routes (ignore the returned server)
    await registerRoutes(app);

    // Serve static files
    const distPath = path.join(__dirname, "../dist/public");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.use("*", (_req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    initialized = true;
  }
}

// Export as Vercel serverless handler
export default async function handler(req: any, res: any) {
  await initializeApp();
  return app(req, res);
}
