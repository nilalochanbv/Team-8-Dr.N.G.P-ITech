import { prisma } from "./db.js";
import { logger } from "../utils/logger.js";

async function main() {
  logger.info("Starting database seed...");

  // Clear existing tracks and trends
  await prisma.projectTask.deleteMany();
  await prisma.projectSubmission.deleteMany();
  await prisma.projectMilestone.deleteMany();
  await prisma.projectTrack.deleteMany();
  await prisma.skillTrend.deleteMany();

  // Create Project Tracks
  const track1 = await prisma.projectTrack.create({
    data: {
      title: "Full-Stack SaaS Architecture",
      description: "Master clean architecture patterns, database design, and real-time dashboard notification pipelines.",
      difficulty: "ADVANCED",
      skills: JSON.stringify(["Next.js", "Express.js", "TypeScript", "Prisma", "Socket.IO"]),
    }
  });

  const milestone1_1 = await prisma.projectMilestone.create({
    data: {
      trackId: track1.id,
      title: "Monorepo Setup & Database Modeling",
      description: "Establish the directory layout, configure the prisma schema, and run migrations.",
      order: 1,
    }
  });

  await prisma.projectTask.createMany({
    data: [
      { milestoneId: milestone1_1.id, title: "Initialize monorepo packages", description: "Create frontend and backend folders.", points: 50 },
      { milestoneId: milestone1_1.id, title: "Define prisma schema models", description: "Write user, profile, and roles schemas.", points: 80 },
    ]
  });

  const milestone1_2 = await prisma.projectMilestone.create({
    data: {
      trackId: track1.id,
      title: "Authentication & Role Guards",
      description: "Implement JWT, refresh token rotation, and express access controllers.",
      order: 2,
    }
  });

  await prisma.projectTask.createMany({
    data: [
      { milestoneId: milestone1_2.id, title: "Configure bcrypt hashing", description: "Encrypt credentials safely.", points: 70 },
      { milestoneId: milestone1_2.id, title: "Write role-based access middleware", description: "Enforce student/mentor separations.", points: 90 },
    ]
  });

  const track2 = await prisma.projectTrack.create({
    data: {
      title: "AI Agent & Twin Ecosystem",
      description: "Build deep LLM integrations, dynamic chat interview loops, and evaluation arbiters.",
      difficulty: "ADVANCED",
      skills: JSON.stringify(["OpenAI", "Prompt Engineering", "TypeScript", "Chatbot Design"]),
    }
  });

  const milestone2_1 = await prisma.projectMilestone.create({
    data: {
      trackId: track2.id,
      title: "OpenAI Client Wrappers & Fallbacks",
      description: "Build robust LLM completion clients featuring fully local mock fallbacks.",
      order: 1,
    }
  });

  await prisma.projectTask.createMany({
    data: [
      { milestoneId: milestone2_1.id, title: "Implement LLM completions request", description: "Query API with structured JSON output.", points: 100 },
      { milestoneId: milestone2_1.id, title: "Design local heuristic backup fallback", description: "Return data-driven mocks offline.", points: 120 },
    ]
  });

  // Create Skill Trends
  await prisma.skillTrend.createMany({
    data: [
      { name: "React 19 & Next.js 15 App Router", category: "TRENDING", demandScore: 9.8, avgSalary: 145000, growthRate: 0.45 },
      { name: "TypeScript & Prisma ORM", category: "TRENDING", demandScore: 9.2, avgSalary: 130000, growthRate: 0.35 },
      { name: "AI Agentic Architectures & OpenAI", category: "FUTURE", demandScore: 9.9, avgSalary: 165000, growthRate: 0.85 },
      { name: "Docker & Kubernetes Orchestration", category: "TRENDING", demandScore: 8.8, avgSalary: 140000, growthRate: 0.25 },
      { name: "Legacy REST APIs", category: "DECLINING", demandScore: 4.2, avgSalary: 95000, growthRate: -0.15 },
      { name: "Manual Deployments & FTP", category: "DECLINING", demandScore: 2.1, avgSalary: 80000, growthRate: -0.45 }
    ]
  });

  logger.info("Database seed finished successfully!");
}

main()
  .catch((e) => {
    logger.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
