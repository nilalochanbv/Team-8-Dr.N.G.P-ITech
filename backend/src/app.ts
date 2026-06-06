import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { config } from "./config/index.js";
import { logger } from "./utils/logger.js";
import { errorHandler } from "./middleware/errors.js";
import { globalRateLimiter } from "./middleware/rateLimiter.js";
import authRoutes from "./modules/auth/routes.js";
import systemRoutes from "./modules/system.routes.js";
import { socketEvents } from "./modules/sockets.js";

const app = express();
const server = http.createServer(app);

// Initialize Sockets
socketEvents.initialize(server);

// Security and utility Middlewares
app.use(helmet({
  contentSecurityPolicy: false // disabled to make local sandbox visualization easier
}));
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

// Global Rate Limiter
app.use(globalRateLimiter);

// Serve uploads folder statically for mock local S3 fallback files
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

// Register Base Routers
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/system", systemRoutes);

// Swagger Spec Documentation Endpoint
app.get("/api/v1/docs", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>SkillOS API Documentation</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #0d0e12; color: #e2e8f0; padding: 2.5rem; }
        h1 { color: #818cf8; border-bottom: 1px solid #1f2937; padding-bottom: 1rem; }
        .endpoint { background-color: #111827; border: 1px solid #1f2937; border-radius: 8px; margin-bottom: 1rem; padding: 1rem; }
        .method { font-weight: bold; padding: 0.25rem 0.5rem; border-radius: 4px; display: inline-block; font-size: 0.85rem; margin-right: 0.5rem; }
        .get { background-color: #047857; color: #a7f3d0; }
        .post { background-color: #1d4ed8; color: #bfdbfe; }
        .put { background-color: #b45309; color: #fde68a; }
        code { font-family: monospace; font-size: 1rem; color: #f43f5e; }
        .desc { margin-top: 0.5rem; font-size: 0.95rem; color: #9ca3af; }
      </style>
    </head>
    <body>
      <h1>SkillOS Ecosystem - API Version 1.0 Specs</h1>
      <p>Authentication headers should be supplied as: <code>Authorization: Bearer &lt;access_token&gt;</code></p>
      
      <div class="endpoint">
        <span class="method post">POST</span> <code>/api/v1/auth/signup</code>
        <div class="desc">Registers a new account. Body: { email, password, fullName, role }</div>
      </div>
      <div class="endpoint">
        <span class="method post">POST</span> <code>/api/v1/auth/login</code>
        <div class="desc">Logs in a user. Returns accessToken and refreshToken. Body: { email, password }</div>
      </div>
      <div class="endpoint">
        <span class="method post">POST</span> <code>/api/v1/auth/refresh</code>
        <div class="desc">Generates a new access token using a valid refreshToken. Body: { refreshToken }</div>
      </div>
      
      <div class="endpoint">
        <span class="method get">GET</span> <code>/api/v1/system/profile/me</code>
        <div class="desc">Fetches current authenticated profile information.</div>
      </div>
      <div class="endpoint">
        <span class="method put">PUT</span> <code>/api/v1/system/profile/me</code>
        <div class="desc">Updates profile details (skills, bio, URLs).</div>
      </div>
      <div class="endpoint">
        <span class="method get">GET</span> <code>/api/v1/system/projects/tracks</code>
        <div class="desc">Lists all project learning tracks, milestones, and tasks.</div>
      </div>
      <div class="endpoint">
        <span class="method post">POST</span> <code>/api/v1/system/projects/submit</code>
        <div class="desc">Submits a milestone repo link for review (Students only). Body: { milestoneId, repoUrl }</div>
      </div>
      <div class="endpoint">
        <span class="method post">POST</span> <code>/api/v1/system/projects/submissions/:id/review</code>
        <div class="desc">Reviews milestone, calculates Chaos Score, and auto-generates portfolio entry (Mentors only). Body: { status, feedback, score }</div>
      </div>
      <div class="endpoint">
        <span class="method get">GET</span> <code>/api/v1/system/twin/me</code>
        <div class="desc">Fetches the AI Employability Twin profile, predictions, and growth trend forecasts.</div>
      </div>
      <div class="endpoint">
        <span class="method post">POST</span> <code>/api/v1/system/simulations/step</code>
        <div class="desc">Executes next step of Technical or HR chat interview simulations. Body: { type, history }</div>
      </div>
      <div class="endpoint">
        <span class="method post">POST</span> <code>/api/v1/system/battle</code>
        <div class="desc">Orchestrates Student AI Twin vs Recruiter matching battle. Body: { recruiterId }</div>
      </div>
      <div class="endpoint">
        <span class="method get">GET</span> <code>/api/v1/system/analytics</code>
        <div class="desc">Gets customized dashboard analytics charts data for Student, Recruiter, Company, or College Admin roles.</div>
      </div>
    </body>
    </html>
  `);
});

// Fallback Endpoint
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint route not found." });
});

// Error handling middleware
app.use(errorHandler as any);

// Start server
server.listen(config.port, () => {
  logger.info(`SkillOS Backend listening at http://localhost:${config.port}`);
  logger.info(`API Docs specs page accessible at http://localhost:${config.port}/api/v1/docs`);
});
