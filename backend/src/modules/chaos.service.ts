import { prisma } from "../config/db.js";
import { systemRepository } from "./system.repository.js";

export const chaosService = {
  /**
   * Calculates weighted chaos score
   */
  calculateScore(params: {
    innovation: number; // 0-100
    complexity: number; // 0-100
    uniqueness: number; // 0-100
    impact: number;     // 0-100
    contribution: number; // 0-100
  }): number {
    const rawScore = 
      (params.innovation * 0.25) +
      (params.complexity * 0.25) +
      (params.uniqueness * 0.20) +
      (params.impact * 0.20) +
      (params.contribution * 0.10);
    
    return Math.min(100, Math.max(0, Math.round(rawScore)));
  },

  /**
   * Determines badge level based on score
   */
  getBadgeLevel(score: number): "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "TITAN" {
    if (score >= 90) return "TITAN";
    if (score >= 75) return "PLATINUM";
    if (score >= 60) return "GOLD";
    if (score >= 40) return "SILVER";
    return "BRONZE";
  },

  /**
   * Evaluates a submission, updates student chaos score, badge levels, and issues badges
   */
  async evaluateSubmissionChaos(studentId: string, submissionId: string, params: {
    innovation: number;
    complexity: number;
    uniqueness: number;
    impact: number;
    contribution: number;
  }) {
    const chaosScore = this.calculateScore(params);
    const badgeLevel = this.getBadgeLevel(chaosScore);

    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: { user: true }
    });

    if (!student) {
      throw { status: 404, message: "Student profile not found." };
    }

    // Update student scores
    const updatedStudent = await prisma.studentProfile.update({
      where: { id: studentId },
      data: {
        chaosScore: chaosScore,
        badgeLevel: badgeLevel,
        // Also boost employability score based on innovation success
        employabilityScore: Math.min(100, student.employabilityScore + Math.round(chaosScore * 0.1))
      }
    });

    // Send notification
    await systemRepository.createNotification(
      student.userId,
      "PROJECT",
      "Chaos Score Calculated!",
      `Your project milestone has been reviewed! Chaos Score: ${chaosScore} (${badgeLevel} Badge Level)`
    );

    // If badge level changed/promoted, send special milestone notification
    if (badgeLevel !== student.badgeLevel) {
      await systemRepository.createNotification(
        student.userId,
        "SYSTEM",
        "Badge Level Promoted!",
        `Congratulations! You've been promoted to the ${badgeLevel} rank in the SkillOS Ecosystem.`
      );
    }

    return {
      chaosScore,
      badgeLevel,
      student: updatedStudent
    };
  }
};
