import { prisma } from "../../../config/db.js";

export const userRepository = {
  async getProfileByUserId(userId: string) {
    return prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            studentProfile: true,
            mentorProfile: true,
            recruiterProfile: true,
            companyProfile: true,
            collegeProfile: true
          }
        }
      }
    });
  },

  async updateProfile(userId: string, data: {
    fullName?: string;
    avatarUrl?: string;
    bio?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    resumeUrl?: string;
    skills?: string; // stringified array
    education?: string; // stringified array
    certifications?: string; // stringified array
    experience?: string; // stringified array
  }) {
    // Update main Profile
    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        fullName: data.fullName,
        avatarUrl: data.avatarUrl,
        bio: data.bio,
        githubUrl: data.githubUrl,
        linkedinUrl: data.linkedinUrl,
        portfolioUrl: data.portfolioUrl,
        resumeUrl: data.resumeUrl,
        skills: data.skills,
        education: data.education,
        certifications: data.certifications,
        experience: data.experience,
      }
    });

    return updatedProfile;
  },

  async searchProfiles(query: string, filters: { role?: string; skills?: string[] }) {
    const whereClause: any = {};

    if (query) {
      whereClause.fullName = { contains: query };
    }

    if (filters.role) {
      whereClause.user = { role: filters.role };
    }

    const profiles = await prisma.profile.findMany({
      where: whereClause,
      include: { user: true }
    });

    // Client-side skill filter because sqlite is JSON-insensitive
    if (filters.skills && filters.skills.length > 0) {
      const targetSkills = filters.skills.map((s) => s.toLowerCase());
      return profiles.filter((p) => {
        try {
          const profileSkills: string[] = JSON.parse(p.skills || "[]");
          return targetSkills.every((ts) =>
            profileSkills.some((ps) => ps.toLowerCase().includes(ts))
          );
        } catch {
          return false;
        }
      });
    }

    return profiles;
  }
};
