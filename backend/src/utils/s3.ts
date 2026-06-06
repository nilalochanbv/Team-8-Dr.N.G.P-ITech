import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "../config/index.js";
import fs from "fs";
import path from "path";
import { logger } from "./logger.js";

let s3Client: S3Client | null = null;

if (!config.s3.useMock) {
  try {
    s3Client = new S3Client({
      region: config.s3.region,
      credentials: {
        accessKeyId: config.s3.accessKeyId,
        secretAccessKey: config.s3.secretAccessKey,
      },
    });
    logger.info("AWS S3 client initialized successfully.");
  } catch (error) {
    logger.error("Failed to initialize AWS S3 client. Falling back to mock local storage.", error);
    config.s3.useMock = true;
  }
} else {
  logger.info("AWS S3 configuration missing or set to mock. Using mock local file storage.");
}

// Ensure local uploads directory exists for fallback
const localUploadsDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(localUploadsDir)) {
  fs.mkdirSync(localUploadsDir, { recursive: true });
}

export const fileStorage = {
  /**
   * Upload file buffer to S3 or local directory
   */
  async uploadFile(fileName: string, fileBuffer: Buffer, mimeType: string): Promise<string> {
    const uniqueName = `${Date.now()}-${fileName}`;
    
    if (config.s3.useMock || !s3Client) {
      const filePath = path.join(localUploadsDir, uniqueName);
      await fs.promises.writeFile(filePath, fileBuffer);
      return `/uploads/${uniqueName}`;
    }

    try {
      const command = new PutObjectCommand({
        Bucket: config.s3.bucketName,
        Key: uniqueName,
        Body: fileBuffer,
        ContentType: mimeType,
      });
      await s3Client.send(command);
      return `https://${config.s3.bucketName}.s3.${config.s3.region}.amazonaws.com/${uniqueName}`;
    } catch (error) {
      logger.error("Error uploading file to AWS S3. Falling back to local storage.", error);
      const filePath = path.join(localUploadsDir, uniqueName);
      await fs.promises.writeFile(filePath, fileBuffer);
      return `/uploads/${uniqueName}`;
    }
  },

  /**
   * Generates a signed URL for file download/view
   */
  async getDownloadUrl(fileKey: string): Promise<string> {
    if (fileKey.startsWith("/") || config.s3.useMock || !s3Client) {
      // It's a local mock file path
      return fileKey;
    }

    try {
      const command = new GetObjectCommand({
        Bucket: config.s3.bucketName,
        Key: fileKey,
      });
      const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      return url;
    } catch (error) {
      logger.error("Error generating signed S3 URL. Returning key as-is.", error);
      return fileKey;
    }
  }
};
