import { prisma } from "../config/db.js";

export const systemRepository = {
  // --- Mentor Profile & Bookings ---
  async getMentors() {
    return prisma.mentorProfile.findMany({
      include: {
        user: {
          include: {
            profile: true
          }
        },
        reviews: true
      }
    });
  },

  async createMentorReview(data: { mentorId: string; reviewerName: string; rating: number; comment: string }) {
    return prisma.$transaction(async (tx) => {
      const review = await tx.mentorReview.create({ data });
      
      // Re-calculate average rating for the mentor
      const reviews = await tx.mentorReview.findMany({ where: { mentorId: data.mentorId } });
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      
      await tx.mentorProfile.update({
        where: { id: data.mentorId },
        data: { rating: Number(avgRating.toFixed(1)) }
      });

      return review;
    });
  },

  async createBooking(data: { mentorId: string; studentId: string; scheduledAt: Date; duration: number; notes?: string }) {
    return prisma.sessionBooking.create({
      data: {
        ...data,
        status: "PENDING"
      },
      include: {
        mentor: {
          include: {
            user: {
              include: { profile: true }
            }
          }
        }
      }
    });
  },

  async getBookingsForUser(userId: string, role: string) {
    if (role === "STUDENT") {
      const student = await prisma.studentProfile.findUnique({ where: { userId } });
      if (!student) return [];
      return prisma.sessionBooking.findMany({
        where: { studentId: student.id },
        include: { mentor: { include: { user: { include: { profile: true } } } } }
      });
    } else if (role === "MENTOR") {
      const mentor = await prisma.mentorProfile.findUnique({ where: { userId } });
      if (!mentor) return [];
      return prisma.sessionBooking.findMany({
        where: { mentorId: mentor.id },
        include: { student: { include: { user: { include: { profile: true } } } } }
      });
    }
    return [];
  },

  async updateBookingStatus(bookingId: string, status: string) {
    return prisma.sessionBooking.update({
      where: { id: bookingId },
      data: { status }
    });
  },

  // --- Internship Gigs Marketplace ---
  async createInternshipJob(data: { companyId: string; title: string; description: string; duration: string; stipend: string; requirements: string }) {
    return prisma.internshipJob.create({ data });
  },

  async getInternshipJobs() {
    return prisma.internshipJob.findMany({
      include: {
        company: {
          include: {
            user: { include: { profile: true } }
          }
        }
      }
    });
  },

  async applyToInternship(data: { jobId: string; studentId: string; resumeUrl?: string; coverLetter?: string }) {
    return prisma.internshipApplication.create({
      data: {
        ...data,
        status: "APPLIED"
      }
    });
  },

  async getApplicationsForJob(jobId: string) {
    return prisma.internshipApplication.findMany({
      where: { jobId },
      include: {
        student: {
          include: {
            user: { include: { profile: true } }
          }
        }
      }
    });
  },

  async getApplicationsForStudent(studentId: string) {
    return prisma.internshipApplication.findMany({
      where: { studentId },
      include: {
        job: {
          include: { company: true }
        }
      }
    });
  },

  async updateApplicationStatus(applicationId: string, status: string) {
    return prisma.internshipApplication.update({
      where: { id: applicationId },
      data: { status },
      include: {
        student: true,
        job: true
      }
    });
  },

  // --- Peer Squads & Matching ---
  async getSquads() {
    return prisma.peerSquad.findMany({
      include: {
        members: {
          include: {
            student: { include: { user: { include: { profile: true } } } }
          }
        }
      }
    });
  },

  async createSquad(name: string, description: string, studentId: string) {
    return prisma.$transaction(async (tx) => {
      const squad = await tx.peerSquad.create({
        data: { name, description }
      });

      await tx.squadMember.create({
        data: {
          squadId: squad.id,
          studentId,
          role: "LEAD"
        }
      });

      return tx.peerSquad.findUnique({
        where: { id: squad.id },
        include: { members: true }
      });
    });
  },

  async joinSquad(squadId: string, studentId: string) {
    return prisma.squadMember.create({
      data: {
        squadId,
        studentId,
        role: "MEMBER"
      }
    });
  },

  // --- Skills Intelligence ---
  async getSkillTrends() {
    return prisma.skillTrend.findMany();
  },

  async updateSkillTrend(data: { name: string; category: string; demandScore: number; avgSalary: number; growthRate: number }) {
    return prisma.skillTrend.upsert({
      where: { name: data.name },
      update: {
        category: data.category,
        demandScore: data.demandScore,
        avgSalary: data.avgSalary,
        growthRate: data.growthRate,
        updatedAt: new Date()
      },
      create: data
    });
  },

  // --- AI Twin State ---
  async getAITwinByStudent(studentId: string) {
    return prisma.aIEmployabilityTwin.findUnique({
      where: { studentId }
    });
  },

  async saveAITwin(studentId: string, data: {
    employabilityScore: number;
    confidenceScore: number;
    portfolioStrengthScore: number;
    careerPredictions: string;
    skillGaps: string;
    growthForecast: string;
  }) {
    return prisma.aIEmployabilityTwin.upsert({
      where: { studentId },
      update: {
        ...data,
        lastUpdated: new Date()
      },
      create: {
        studentId,
        ...data
      }
    });
  },

  // --- Interview Simulations ---
  async createSimulation(data: {
    studentId: string;
    type: string;
    transcript: string;
    score: number;
    feedback: string;
    skillGaps: string;
    roadmap: string;
  }) {
    return prisma.interviewSimulation.create({ data });
  },

  async getSimulationsByStudent(studentId: string) {
    return prisma.interviewSimulation.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" }
    });
  },

  // --- AI Battles ---
  async createBattle(data: {
    studentId: string;
    matchingScore: number;
    technicalScore: number;
    communicationScore: number;
    culturalFitScore: number;
    hiringDecision: boolean;
    feedback: string;
  }) {
    return prisma.aIBattle.create({ data });
  },

  async getBattlesByStudent(studentId: string) {
    return prisma.aIBattle.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" }
    });
  },

  // --- Notifications Storage ---
  async createNotification(userId: string, category: string, title: string, message: string) {
    return prisma.notification.create({
      data: { userId, category, title, message, isRead: false }
    });
  },

  async getNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
  },

  async markNotificationAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
  },

  async markAllNotificationsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId },
      data: { isRead: true }
    });
  }
};
