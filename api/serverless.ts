import { type Server } from "node:http";
import express, { type Express } from "express";
import { registerRoutes } from "../server/routes";
import { initializeFirebaseAdmin } from "../server/firebaseAdmin";
import path from "path";
import fs from "fs";

// Create Express app for serverless
const app = express();

app.use(express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

// Initialize Firebase Admin
try {
  initializeFirebaseAdmin();
  console.log("Firebase Admin SDK initialized");
} catch (error) {
  console.error("Firebase Admin initialization failed:", error);
}

// Register API routes
let initialized = false;
async function initializeApp() {
  if (!initialized) {
    await registerRoutes(app);

    // Serve static files
    const distPath = path.resolve(process.cwd(), "dist/public");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.use("*", (_req, res) => {
        res.sendFile(path.resolve(distPath, "index.html"));
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
