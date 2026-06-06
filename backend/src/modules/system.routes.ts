import { Router } from "express";
import { systemController } from "./system.controller.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";

const router = Router();

// Apply JWT authentication to all system routes
router.use(authenticateToken as any);

// Profiles
router.get("/profile/me", systemController.getMyProfile as any);
router.put("/profile/me", systemController.updateMyProfile as any);
router.get("/profile/search", systemController.searchProfiles as any);

// Projects Hub
router.get("/projects/tracks", systemController.listTracks as any);
router.get("/projects/tracks/:id", systemController.getTrack as any);
router.post("/projects/submit", requireRole(["STUDENT"]) as any, systemController.submitProject as any);
router.post("/projects/submissions/:id/review", requireRole(["MENTOR"]) as any, systemController.reviewProject as any);

// Mentor Bookings
router.get("/mentors", systemController.listMentors as any);
router.post("/mentors/booking", requireRole(["STUDENT"]) as any, systemController.bookSession as any);
router.post("/mentors/bookings/:id/review", requireRole(["MENTOR"]) as any, systemController.reviewBooking as any);

// Internship marketplace
router.post("/internships", requireRole(["COMPANY", "RECRUITER"]) as any, systemController.postInternship as any);
router.get("/internships", systemController.listJobs as any);
router.post("/internships/apply", requireRole(["STUDENT"]) as any, systemController.applyToJob as any);
router.post("/internships/applications/:id/review", requireRole(["COMPANY", "RECRUITER"]) as any, systemController.reviewApplication as any);

// Squads
router.get("/squads", systemController.listSquads as any);
router.post("/squads", requireRole(["STUDENT"]) as any, systemController.createSquad as any);

// Skills Trends
router.get("/skills/trends", systemController.getSkillTrends as any);

// AI Twin
router.get("/twin/me", requireRole(["STUDENT"]) as any, systemController.getMyTwin as any);
router.post("/twin/regenerate", requireRole(["STUDENT"]) as any, systemController.regenerateMyTwin as any);

// Hiring Simulator
router.get("/simulations", requireRole(["STUDENT"]) as any, systemController.listSimulations as any);
router.post("/simulations/step", requireRole(["STUDENT"]) as any, systemController.runSimulationStep as any);

// AI vs AI Battle
router.post("/battle", requireRole(["STUDENT"]) as any, systemController.fightAIBattle as any);

// Sockets & Notifications
router.get("/notifications", systemController.getNotifications as any);
router.post("/notifications/clear", systemController.clearNotifications as any);

// Dashboard Analytics
router.get("/analytics", systemController.getAnalytics as any);

export default router;
