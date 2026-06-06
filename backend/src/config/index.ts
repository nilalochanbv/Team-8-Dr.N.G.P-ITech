import dotenv from "dotenv";
import path from "path";

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "skillos-super-secret-key-1337-change-me-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15m",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "skillos-refresh-secret-key-4200-change-me",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  
  // AWS S3
  s3: {
    bucketName: process.env.AWS_S3_BUCKET_NAME || "skillos-portfolio-assets",
    region: process.env.AWS_REGION || "us-east-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    useMock: !process.env.AWS_ACCESS_KEY_ID || process.env.AWS_MOCK_STORAGE === "true",
  },

  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY || "",
    useMock: !process.env.OPENAI_API_KEY || process.env.OPENAI_MOCK === "true",
  },

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || "*",
};
