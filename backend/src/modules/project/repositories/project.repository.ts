import { prisma } from "../../../config/db.js";

export const projectRepository = {
  async getTracks() {
    return prisma.projectTrack.findMany({
      include: {
        milestones: {
          include: {
            tasks: true
          }
        }
      }
    });
  },

  async getTrackById(id: string) {
    return prisma.projectTrack.findUnique({
      where: { id },
      include: {
        milestones: {
          include: {
            tasks: true
          }
        }
      }
    });
  },

  async createSubmission(data: {
    studentId: string;
    milestoneId: string;
    repoUrl: string;
    demoUrl?: string;
  }) {
    return prisma.projectSubmission.create({
      data: {
        studentId: data.studentId,
        milestoneId: data.milestoneId,
        repoUrl: data.repoUrl,
        demoUrl: data.demoUrl,
        status: "PENDING"
      }
    });
  },

  async getSubmissionsByStudent(studentId: string) {
    return prisma.projectSubmission.findMany({
      where: { studentId },
      include: {
        milestone: {
          include: {
            track: true
          }
        },
        mentor: {
          include: {
            user: {
              include: {
                profile: true
              }
            }
          }
        }
      }
    });
  },

  async reviewSubmission(submissionId: string, data: {
    mentorId: string;
    status: "APPROVED" | "REJECTED";
    feedback: string;
    score: number;
  }) {
    return prisma.projectSubmission.update({
      where: { id: submissionId },
      data: {
        mentorId: data.mentorId,
        status: data.status,
        feedback: data.feedback,
        score: data.score,
        reviewedAt: new Date()
      },
      include: {
        student: true,
        milestone: {
          include: {
            track: true
          }
        }
      }
    });
  },

  async getPendingSubmissions() {
    return prisma.projectSubmission.findMany({
      where: { status: "PENDING" },
      include: {
        student: {
          include: {
            user: {
              include: {
                profile: true
              }
            }
          }
        },
        milestone: {
          include: {
            track: true
          }
        }
      }
    });
  }
};
