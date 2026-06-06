import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { systemService } from "./system.service.js";

export const systemController = {
  // --- Profile APIs ---
  async getMyProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await systemService.getProfile(req.user!.id);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async updateMyProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await systemService.updateProfile(req.user!.id, req.body);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async searchProfiles(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const query = (req.query.q as string) || "";
      const result = await systemService.searchProfiles(query, req.query);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  // --- Project Hub APIs ---
  async listTracks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await systemService.listTracks();
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async getTrack(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await systemService.getTrack(req.params.id);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async submitProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await systemService.submitProject(req.user!.id, req.body);
      return res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  async reviewProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await systemService.reviewProject(req.user!.id, req.params.id, req.body);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  // --- Mentor Network APIs ---
  async listMentors(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await systemService.listMentors();
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async bookSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await systemService.bookSession(req.user!.id, req.body);
      return res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  async reviewBooking(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await systemService.reviewBooking(req.user!.id, req.params.id, req.body.status);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  // --- Internship Marketplace APIs ---
  async postInternship(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await systemService.postInternship(req.user!.id, req.body);
      return res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  async listJobs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await systemService.listJobs();
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async applyToJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await systemService.applyToJob(req.user!.id, req.body);
      return res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  async reviewApplication(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await systemService.reviewApplication(req.user!.id, req.params.id, req.body.status);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  // --- Peer Squad Workspace APIs ---
  async listSquads(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await systemService.listSquads();
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async createSquad(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await systemService.createSquad(req.user!.id, req.body.name, req.body.description);
      return res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  // --- Skills Intelligence APIs ---
  async getSkillTrends(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await prisma.skillTrend.findMany();
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  // --- AI Employability Twin APIs ---
  async getMyTwin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await systemService.getStudentTwin(req.user!.id);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async regenerateMyTwin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      // Find student profile ID
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        include: { studentProfile: true }
      });
      if (!user || !user.studentProfile) throw { status: 404, message: "Student profile not found." };
      
      const result = await systemService.regenerateStudentTwin(user.studentProfile.id);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  // --- Hiring Simulator APIs ---
  async listSimulations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await systemService.listSimulations(req.user!.id);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async runSimulationStep(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await systemService.runSimulationStep(req.user!.id, req.body);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  // --- AI Battle APIs ---
  async fightAIBattle(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await systemService.fightAIBattle(req.user!.id, req.body);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  // --- Notifications APIs ---
  async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await systemService.fetchNotifications(req.user!.id);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async clearNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await systemService.clearNotifications(req.user!.id);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  // --- Dashboard Analytics APIs ---
  async getAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await systemService.getRoleAnalytics(req.user!.id, req.user!.role);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
};
import { prisma } from "../config/db.js";
