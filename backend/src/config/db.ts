import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger.js";

export const prisma = new PrismaClient({
  log: ["error", "warn"],
});

// Test connection
prisma.$connect()
  .then(() => {
    logger.info("Successfully connected to SQLite database via Prisma.");
  })
  .catch((err) => {
    logger.error("Failed to connect to SQLite database:", err);
  });
