import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { logger } from "../utils/logger.js";

let io: SocketIOServer | null = null;
const userSockets = new Map<string, string>(); // userId -> socketId

export const socketEvents = {
  /**
   * Initializes the Socket.io server
   */
  initialize(server: HTTPServer) {
    io = new SocketIOServer(server, {
      cors: {
        origin: config.corsOrigin,
        methods: ["GET", "POST"]
      }
    });

    // Authenticate socket connections
    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication failed: Token required."));
      }

      try {
        const decoded = jwt.verify(token, config.jwtSecret) as { id: string };
        (socket as any).userId = decoded.id;
        next();
      } catch (err) {
        return next(new Error("Authentication failed: Invalid token."));
      }
    });

    io.on("connection", (socket) => {
      const userId = (socket as any).userId;
      userSockets.set(userId, socket.id);
      logger.info(`User Socket Connected: userId=${userId}, socketId=${socket.id}`);

      socket.on("disconnect", () => {
        userSockets.delete(userId);
        logger.info(`User Socket Disconnected: userId=${userId}`);
      });
    });
  },

  /**
   * Emits a real-time event/notification to a specific user
   */
  emitNotification(userId: string, data: { id: string; category: string; title: string; message: string }) {
    if (!io) return;
    const socketId = userSockets.get(userId);
    if (socketId) {
      io.to(socketId).emit("notification", data);
      logger.debug(`Real-time notification emitted to socketId=${socketId}`);
    }
  }
};
