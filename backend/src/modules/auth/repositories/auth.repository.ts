import { prisma } from "../../../config/db.js";

export const authRepository = {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        studentProfile: true,
        mentorProfile: true,
        recruiterProfile: true,
        companyProfile: true,
        collegeProfile: true,
      }
    });
  },

  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        studentProfile: true,
        mentorProfile: true,
        recruiterProfile: true,
        companyProfile: true,
        collegeProfile: true,
      }
    });
  },

  async createUser(data: {
    email: string;
    passwordHash: string;
    role: string;
    fullName: string;
  }) {
    return prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: data.passwordHash,
          role: data.role,
        }
      });

      // Create base Profile
      await tx.profile.create({
        data: {
          userId: user.id,
          fullName: data.fullName,
          skills: "[]",
          education: "[]",
          certifications: "[]",
          experience: "[]",
        }
      });

      // Initialize role-specific profile tables
      if (data.role === "STUDENT") {
        await tx.studentProfile.create({
          data: {
            userId: user.id,
            employabilityScore: 60,
            chaosScore: 0,
            badgeLevel: "BRONZE",
          }
        });
      } else if (data.role === "MENTOR") {
        await tx.mentorProfile.create({
          data: {
            userId: user.id,
            specialties: "[]",
            rating: 5.0,
            availability: "[]",
          }
        });
      } else if (data.role === "RECRUITER") {
        // Find or create a default company for recruiters to reference
        let defaultCompany = await tx.companyProfile.findFirst();
        if (!defaultCompany) {
          // Create a mock default company if none exists
          const defaultUser = await tx.user.create({
            data: {
              email: `default-company-${Date.now()}@skillos.ai`,
              passwordHash: "MOCK_HASH",
              role: "COMPANY",
            }
          });
          defaultCompany = await tx.companyProfile.create({
            data: {
              userId: defaultUser.id,
              name: "SkillOS Partner Enterprise",
              industry: "Technology",
            }
          });
        }
        await tx.recruiterProfile.create({
          data: {
            userId: user.id,
            companyId: defaultCompany.id,
          }
        });
      } else if (data.role === "COMPANY") {
        await tx.companyProfile.create({
          data: {
            userId: user.id,
            name: `${data.fullName} Corporation`,
            industry: "Technology",
          }
        });
      } else if (data.role === "COLLEGE_ADMIN") {
        await tx.collegeProfile.create({
          data: {
            userId: user.id,
            name: `${data.fullName} University`,
          }
        });
      }

      return tx.user.findUnique({
        where: { id: user.id },
        include: {
          profile: true,
          studentProfile: true,
          mentorProfile: true,
          recruiterProfile: true,
          companyProfile: true,
          collegeProfile: true,
        }
      });
    });
  },

  // Session Token management
  async createSession(userId: string, refreshToken: string, expiresAt: Date) {
    return prisma.session.create({
      data: {
        userId,
        refreshToken,
        expiresAt,
      }
    });
  },

  async findSession(refreshToken: string) {
    return prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true }
    });
  },

  async deleteSession(refreshToken: string) {
    return prisma.session.delete({
      where: { refreshToken }
    }).catch(() => null); // ignore errors if session doesn't exist
  },

  async updateVerificationStatus(userId: string, isVerified: boolean) {
    return prisma.user.update({
      where: { id: userId },
      data: { isEmailVerified: isVerified }
    });
  }
};
