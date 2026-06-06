import { prisma } from "../../../config/db.js";

export const portfolioRepository = {
  async getEntriesByStudent(studentId: string) {
    return prisma.portfolioEntry.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" }
    });
  },

  async createEntry(data: {
    studentId: string;
    title: string;
    description: string;
    sourceType: "PROJECT" | "INTERNSHIP" | "CERTIFICATE";
    sourceId: string;
    skillsUsed: string; // JSON string array
    outcomes: string;
    rating?: number;
  }) {
    return prisma.portfolioEntry.create({
      data: {
        studentId: data.studentId,
        title: data.title,
        description: data.description,
        sourceType: data.sourceType,
        sourceId: data.sourceId,
        skillsUsed: data.skillsUsed,
        outcomes: data.outcomes,
        rating: data.rating
      }
    });
  },

  async deleteEntry(id: string) {
    return prisma.portfolioEntry.delete({
      where: { id }
    });
  },

  async getPortfolioAnalytics(studentId: string) {
    const entries = await prisma.portfolioEntry.findMany({
      where: { studentId }
    });

    const projectCount = entries.filter((e) => e.sourceType === "PROJECT").length;
    const internshipCount = entries.filter((e) => e.sourceType === "INTERNSHIP").length;
    const certCount = entries.filter((e) => e.sourceType === "CERTIFICATE").length;

    // Compile unique skills listed
    const allSkills = new Set<string>();
    entries.forEach((e) => {
      try {
        const skills: string[] = JSON.parse(e.skillsUsed);
        skills.forEach((s) => allSkills.add(s.toLowerCase()));
      } catch {}
    });

    return {
      totalEntries: entries.length,
      projectCount,
      internshipCount,
      certCount,
      uniqueSkillsCount: allSkills.size,
      skills: Array.from(allSkills)
    };
  }
};
