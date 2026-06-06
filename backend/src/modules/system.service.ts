import { userRepository } from "./user/repositories/user.repository.js";
import { projectRepository } from "./project/repositories/project.repository.js";
import { portfolioRepository } from "./portfolio/repositories/portfolio.repository.js";
import { systemRepository } from "./system.repository.js";
import { chaosService } from "./chaos.service.js";
import { aiClient } from "../utils/openai.js";
import { prisma } from "../config/db.js";
import { socketEvents } from "./sockets.js";
import { logger } from "../utils/logger.js";

export const systemService = {
  // --- User Profile Service ---
  async getProfile(userId: string) {
    const profile = await userRepository.getProfileByUserId(userId);
    if (!profile) throw { status: 404, message: "Profile not found." };
    return profile;
  },

  async updateProfile(userId: string, data: any) {
    // Stringify JSON lists if present
    const payload: any = { ...data };
    if (data.skills) payload.skills = JSON.stringify(data.skills);
    if (data.education) payload.education = JSON.stringify(data.education);
    if (data.certifications) payload.certifications = JSON.stringify(data.certifications);
    if (data.experience) payload.experience = JSON.stringify(data.experience);

    return userRepository.updateProfile(userId, payload);
  },

  async searchProfiles(query: string, filters: any) {
    const parsedFilters: any = {};
    if (filters.role) parsedFilters.role = filters.role;
    if (filters.skills) {
      parsedFilters.skills = typeof filters.skills === "string" ? [filters.skills] : filters.skills;
    }
    return userRepository.searchProfiles(query, parsedFilters);
  },

  // --- Project Service ---
  async listTracks() {
    return projectRepository.getTracks();
  },

  async getTrack(trackId: string) {
    return projectRepository.getTrackById(trackId);
  },

  async submitProject(userId: string, data: { milestoneId: string; repoUrl: string; demoUrl?: string }) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { studentProfile: true }
    });

    if (!user || !user.studentProfile) {
      throw { status: 403, message: "Only student roles can submit project milestones." };
    }

    const submission = await projectRepository.createSubmission({
      studentId: user.studentProfile.id,
      milestoneId: data.milestoneId,
      repoUrl: data.repoUrl,
      demoUrl: data.demoUrl
    });

    // Notify administrators / mentors via Sockets
    socketEvents.emitNotification(userId, {
      id: submission.id,
      category: "PROJECT",
      title: "Project Submitted",
      message: "Your project milestone has been submitted and is awaiting review."
    });

    return submission;
  },

  async reviewProject(userId: string, submissionId: string, data: { status: "APPROVED" | "REJECTED"; feedback: string; score: number }) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { mentorProfile: true }
    });

    if (!user || !user.mentorProfile) {
      throw { status: 403, message: "Only registered mentors can review project submissions." };
    }

    const submission = await projectRepository.reviewSubmission(submissionId, {
      mentorId: user.mentorProfile.id,
      status: data.status,
      feedback: data.feedback,
      score: data.score
    });

    if (data.status === "APPROVED") {
      // 1. Calculate Chaos Score
      const params = {
        innovation: data.score, // Base complexity scores on review score
        complexity: Math.min(100, data.score + 5),
        uniqueness: Math.min(100, data.score - 5),
        impact: Math.min(100, data.score + 10),
        contribution: 80
      };
      
      const chaosResult = await chaosService.evaluateSubmissionChaos(
        submission.studentId,
        submissionId,
        params
      );

      // 2. Auto-generate Portfolio Entry
      await portfolioRepository.createEntry({
        studentId: submission.studentId,
        title: `Completed Milestone: ${submission.milestone.title}`,
        description: `Successfully implemented core features of ${submission.milestone.title} from the track "${submission.milestone.track.title}".`,
        sourceType: "PROJECT",
        sourceId: submission.id,
        skillsUsed: submission.milestone.track.skills,
        outcomes: `Demonstrated technical complexity with a Chaos score of ${chaosResult.chaosScore} (${chaosResult.badgeLevel} badge). Code quality assessed at ${data.score}%.`,
        rating: Number((data.score / 20).toFixed(1)) // maps 100 max to 5.0 rating scale
      });

      // 3. Regeneate AI Employability Twin automatically on new portfolio entry
      await this.regenerateStudentTwin(submission.studentId);
    }

    return submission;
  },

  // --- Mentor booking logic ---
  async listMentors() {
    return systemRepository.getMentors();
  },

  async bookSession(userId: string, data: { mentorId: string; scheduledAt: string; duration: number; notes?: string }) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { studentProfile: true }
    });

    if (!user || !user.studentProfile) {
      throw { status: 403, message: "Only student profiles can book sessions." };
    }

    const booking = await systemRepository.createBooking({
      mentorId: data.mentorId,
      studentId: user.studentProfile.id,
      scheduledAt: new Date(data.scheduledAt),
      duration: data.duration,
      notes: data.notes
    });

    // Notify mentor
    const mentor = await prisma.mentorProfile.findUnique({ where: { id: data.mentorId } });
    if (mentor) {
      await systemRepository.createNotification(
        mentor.userId,
        "BOOKING",
        "New Mentor Session Request",
        `Student has requested a ${data.duration}-minute slot on ${new Date(data.scheduledAt).toLocaleString()}.`
      );
    }

    return booking;
  },

  async reviewBooking(userId: string, bookingId: string, status: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { mentorProfile: true }
    });

    if (!user || !user.mentorProfile) {
      throw { status: 403, message: "Access denied: Mentors only." };
    }

    const booking = await systemRepository.updateBookingStatus(bookingId, status);
    
    // Notify student
    const student = await prisma.studentProfile.findUnique({ where: { id: booking.studentId } });
    if (student) {
      await systemRepository.createNotification(
        student.userId,
        "BOOKING",
        "Mentor Booking Update",
        `Your session has been marked as ${status} by the mentor.`
      );
    }

    return booking;
  },

  // --- Internship Marketplace ---
  async postInternship(userId: string, data: { title: string; description: string; duration: string; stipend: string; requirements: string[] }) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { companyProfile: true }
    });

    if (!user || !user.companyProfile) {
      throw { status: 403, message: "Access denied: Company account required." };
    }

    return systemRepository.createInternshipJob({
      companyId: user.companyProfile.id,
      title: data.title,
      description: data.description,
      duration: data.duration,
      stipend: data.stipend,
      requirements: JSON.stringify(data.requirements)
    });
  },

  async listJobs() {
    return systemRepository.getInternshipJobs();
  },

  async applyToJob(userId: string, data: { jobId: string; resumeUrl?: string; coverLetter?: string }) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { studentProfile: true }
    });

    if (!user || !user.studentProfile) {
      throw { status: 403, message: "Access denied: Students only." };
    }

    const app = await systemRepository.applyToInternship({
      jobId: data.jobId,
      studentId: user.studentProfile.id,
      resumeUrl: data.resumeUrl,
      coverLetter: data.coverLetter
    });

    // Notify company
    const job = await prisma.internshipJob.findUnique({ where: { id: data.jobId }, include: { company: true } });
    if (job) {
      await systemRepository.createNotification(
        job.company.userId,
        "INTERNSHIP",
        "New Job Application",
        `A candidate has applied to your job listing: "${job.title}".`
      );
    }

    return app;
  },

  async reviewApplication(userId: string, applicationId: string, status: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { recruiterProfile: true, companyProfile: true }
    });

    if (!user || (!user.recruiterProfile && !user.companyProfile)) {
      throw { status: 403, message: "Access denied: Recruiters or Companies only." };
    }

    const app = await systemRepository.updateApplicationStatus(applicationId, status);
    
    // Notify student
    await systemRepository.createNotification(
      app.student.userId,
      "INTERNSHIP",
      "Application Status Update",
      `Your application for "${app.job.title}" was marked as ${status}.`
    );

    // If candidate selected, auto-inject an Internship portfolio entry!
    if (status === "SELECTED") {
      await portfolioRepository.createEntry({
        studentId: app.studentId,
        title: `Micro Internship: ${app.job.title}`,
        description: `Completed micro-internship at sponsoring company.`,
        sourceType: "INTERNSHIP",
        sourceId: app.id,
        skillsUsed: app.job.requirements,
        outcomes: `Awarded stipend: ${app.job.stipend}. Verified by company HR.`
      });
      await this.regenerateStudentTwin(app.studentId);
    }

    return app;
  },

  // --- Peer Squad Matchmaker Compatibility Algorithm ---
  async listSquads() {
    return systemRepository.getSquads();
  },

  async createSquad(userId: string, name: string, description: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { studentProfile: true } });
    if (!user || !user.studentProfile) throw { status: 403, message: "Students only." };
    
    return systemRepository.createSquad(name, description, user.studentProfile.id);
  },

  async calculateSquadCompatibility(studentId1: string, studentId2: string) {
    const [s1, s2] = await Promise.all([
      prisma.studentProfile.findUnique({ where: { id: studentId1 }, include: { user: { include: { profile: true } } } }),
      prisma.studentProfile.findUnique({ where: { id: studentId2 }, include: { user: { include: { profile: true } } } })
    ]);

    if (!s1 || !s2) return 50; // default baseline

    let s1Skills: string[] = [];
    let s2Skills: string[] = [];
    try {
      s1Skills = JSON.parse(s1.user.profile?.skills || "[]");
      s2Skills = JSON.parse(s2.user.profile?.skills || "[]");
    } catch {}

    // Overlap math
    const intersection = s1Skills.filter((x) => s2Skills.includes(x));
    const union = Array.from(new Set([...s1Skills, ...s2Skills]));

    if (union.length === 0) return 60; // default compatibility

    // Compatibility = (Intersection ratio) + role compatibility bonus
    const skillOverlapRatio = intersection.length / union.length;
    let score = 50 + Math.round(skillOverlapRatio * 40); // up to 90%

    // Add chaos similarity bonus
    const chaosDiff = Math.abs(s1.chaosScore - s2.chaosScore);
    if (chaosDiff < 15) score += 10;

    return Math.min(100, score);
  },

  // --- AI Employability Twin Core Engine ---
  async getStudentTwin(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { studentProfile: true } });
    if (!user || !user.studentProfile) throw { status: 404, message: "Student profile not found." };
    
    let twin = await systemRepository.getAITwinByStudent(user.studentProfile.id);
    if (!twin) {
      twin = await this.regenerateStudentTwin(user.studentProfile.id);
    }
    return twin;
  },

  async regenerateStudentTwin(studentId: string) {
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        user: { include: { profile: true } },
        submissions: true,
        portfolioEntries: true
      }
    });

    if (!student) throw new Error("Student not found for twin compilation.");

    let skills: string[] = [];
    try { skills = JSON.parse(student.user.profile?.skills || "[]"); } catch {}

    // Aggregate profile details
    const context = {
      skills,
      projectSubmissions: student.submissions,
      portfolioCount: student.portfolioEntries.length,
      chaosScore: student.chaosScore,
      badgeLevel: student.badgeLevel,
      employabilityScore: student.employabilityScore
    };

    const result = await aiClient.generateEmployabilityTwin(context);

    // Save/Update in DB
    const savedTwin = await systemRepository.saveAITwin(studentId, {
      employabilityScore: result.employabilityScore,
      confidenceScore: result.confidenceScore,
      portfolioStrengthScore: result.portfolioStrengthScore,
      careerPredictions: JSON.stringify(result.careerPredictions),
      skillGaps: JSON.stringify(result.skillGaps),
      growthForecast: JSON.stringify(result.growthForecast)
    });

    // Also update studentProfile base scores
    await prisma.studentProfile.update({
      where: { id: studentId },
      data: { employabilityScore: result.employabilityScore }
    });

    return savedTwin;
  },

  // --- Hiring Simulator Engine ---
  async listSimulations(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { studentProfile: true } });
    if (!user || !user.studentProfile) throw { status: 403, message: "Students only." };
    return systemRepository.getSimulationsByStudent(user.studentProfile.id);
  },

  async runSimulationStep(userId: string, data: { type: string; history: { role: string; content: string }[] }) {
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { studentProfile: true } });
    if (!user || !user.studentProfile) throw { status: 403, message: "Students only." };

    const response = await aiClient.simulateInterviewDialog(data.history, data.type);

    if (response.isEnd && response.score) {
      // Save simulation result
      await systemRepository.createSimulation({
        studentId: user.studentProfile.id,
        type: data.type,
        transcript: JSON.stringify(data.history),
        score: response.score,
        feedback: response.feedback || "Good job.",
        skillGaps: JSON.stringify(response.skillGaps || []),
        roadmap: JSON.stringify(response.roadmap || [])
      });

      // Update employability score on completion
      const newScore = Math.min(100, user.studentProfile.employabilityScore + Math.round((response.score - 50) * 0.15));
      await prisma.studentProfile.update({
        where: { id: user.studentProfile.id },
        data: { employabilityScore: newScore }
      });
    }

    return response;
  },

  // --- AI vs AI Battle Engine ---
  async fightAIBattle(userId: string, data: { recruiterId: string }) {
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { studentProfile: true } });
    if (!user || !user.studentProfile) throw { status: 403, message: "Students only." };

    const [twin, recruiter] = await Promise.all([
      systemRepository.getAITwinByStudent(user.studentProfile.id),
      prisma.recruiterProfile.findUnique({ where: { id: data.recruiterId }, include: { user: { include: { profile: true } } } })
    ]);

    if (!twin) throw { status: 400, message: "Please compile your AI Employability Twin first." };
    if (!recruiter) throw { status: 404, message: "Company Recruiter profile not found." };

    const evaluation = await aiClient.battleAITwins(twin, recruiter);

    const battleRecord = await systemRepository.createBattle({
      studentId: user.studentProfile.id,
      matchingScore: evaluation.matchingScore,
      technicalScore: evaluation.technicalScore,
      communicationScore: evaluation.communicationScore,
      culturalFitScore: evaluation.culturalFitScore,
      hiringDecision: evaluation.hiringDecision,
      feedback: evaluation.feedback
    });

    return battleRecord;
  },

  // --- Sockets / Notifications ---
  async fetchNotifications(userId: string) {
    return systemRepository.getNotifications(userId);
  },

  async clearNotifications(userId: string) {
    await systemRepository.markAllNotificationsRead(userId);
    return { success: true };
  },

  // --- Role analytics engine ---
  async getRoleAnalytics(userId: string, role: string) {
    if (role === "STUDENT") {
      const student = await prisma.studentProfile.findUnique({
        where: { userId },
        include: { submissions: true, portfolioEntries: true, twin: true }
      });
      if (!student) throw { status: 404, message: "Student metrics not found." };

      return {
        employabilityScore: student.employabilityScore,
        chaosScore: student.chaosScore,
        badgeLevel: student.badgeLevel,
        totalProjects: student.submissions.length,
        portfolioEntriesCount: student.portfolioEntries.length,
        twinConfidence: student.twin?.confidenceScore || 0.6,
        growthForecast: student.twin?.growthForecast ? JSON.parse(student.twin.growthForecast) : []
      };
    } else if (role === "RECRUITER" || role === "COMPANY") {
      const companies = await prisma.companyProfile.count();
      const applicants = await prisma.internshipApplication.count();
      const jobsCount = await prisma.internshipJob.count();
      return {
        companiesCount: companies,
        activeJobs: jobsCount,
        totalApplicants: applicants,
        pipelineMetrics: [
          { status: "APPLIED", count: await prisma.internshipApplication.count({ where: { status: "APPLIED" } }) },
          { status: "SHORTLISTED", count: await prisma.internshipApplication.count({ where: { status: "SHORTLISTED" } }) },
          { status: "SELECTED", count: await prisma.internshipApplication.count({ where: { status: "SELECTED" } }) }
        ]
      };
    } else if (role === "COLLEGE_ADMIN") {
      const totalStudents = await prisma.studentProfile.count();
      const placementsCount = await prisma.internshipApplication.count({ where: { status: "SELECTED" } });
      const averageScore = await prisma.studentProfile.aggregate({
        _avg: { employabilityScore: true }
      });

      return {
        totalStudentsRegistered: totalStudents,
        averageEmployability: Math.round(averageScore._avg.employabilityScore || 65),
        placementsCount,
        placementRatio: totalStudents > 0 ? Number((placementsCount / totalStudents).toFixed(2)) : 0
      };
    } else if (role === "SUPER_ADMIN") {
      return {
        totalUsers: await prisma.user.count(),
        totalStudents: await prisma.studentProfile.count(),
        totalMentors: await prisma.mentorProfile.count(),
        totalCompanies: await prisma.companyProfile.count()
      };
    }
    return {};
  }
};
