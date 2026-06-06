import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../../../config/index.js";
import { authRepository } from "../repositories/auth.repository.js";
import { logger } from "../../../utils/logger.js";

export const authService = {
  async register(data: {
    email: string;
    passwordHash: string;
    role: string;
    fullName: string;
  }) {
    const existing = await authRepository.findUserByEmail(data.email);
    if (existing) {
      throw { status: 400, message: "Email already registered." };
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.passwordHash, salt);

    const user = await authRepository.createUser({
      email: data.email,
      passwordHash,
      role: data.role,
      fullName: data.fullName,
    });

    if (!user) {
      throw { status: 500, message: "Error registering new user." };
    }

    const tokens = await this.generateUserTokens(user);
    return { user, ...tokens };
  },

  async login(data: { email: string; passwordHash: string }) {
    const user = await authRepository.findUserByEmail(data.email);
    if (!user) {
      throw { status: 401, message: "Invalid email or password." };
    }

    const isMatch = await bcrypt.compare(data.passwordHash, user.passwordHash);
    if (!isMatch) {
      throw { status: 401, message: "Invalid email or password." };
    }

    const tokens = await this.generateUserTokens(user);
    return { user, ...tokens };
  },

  async logout(refreshToken: string) {
    await authRepository.deleteSession(refreshToken);
    return { success: true, message: "Logged out successfully." };
  },

  async refresh(refreshToken: string) {
    const session = await authRepository.findSession(refreshToken);
    if (!session || new Date() > session.expiresAt) {
      if (session) {
        await authRepository.deleteSession(refreshToken);
      }
      throw { status: 403, message: "Session expired or invalid refresh token." };
    }

    // Issue new access token
    const accessToken = jwt.sign(
      { id: session.user.id, email: session.user.email, role: session.user.role },
      config.jwtSecret as any,
      { expiresIn: config.jwtExpiresIn as any }
    );

    return { accessToken };
  },

  async generateUserTokens(user: any) {
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret as any,
      { expiresIn: config.jwtExpiresIn as any }
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtRefreshSecret as any,
      { expiresIn: config.jwtRefreshExpiresIn as any }
    );

    // Save session in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days matching jwtRefreshExpiresIn
    await authRepository.createSession(user.id, refreshToken, expiresAt);

    return { accessToken, refreshToken };
  },

  async requestPasswordReset(email: string) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      throw { status: 404, message: "User not found with this email." };
    }

    // Return a mock reset token
    const token = jwt.sign({ id: user.id, email: user.email }, config.jwtSecret as any, { expiresIn: "1h" as any });
    logger.info(`Password reset token requested for ${email}: ${token}`);
    
    return {
      message: "Password reset link sent to your email.",
      resetToken: token // Included for development convenience
    };
  },

  async resetPassword(token: string, newPasswordHash: string) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as { id: string };
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(newPasswordHash, salt);

      const user = await prisma.user.update({
        where: { id: decoded.id },
        data: { passwordHash }
      });

      return { success: true, message: "Password updated successfully." };
    } catch (error) {
      throw { status: 400, message: "Invalid or expired reset token." };
    }
  },

  async verifyEmail(token: string) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as { id: string };
      await authRepository.updateVerificationStatus(decoded.id, true);
      return { success: true, message: "Email verified successfully." };
    } catch (error) {
      throw { status: 400, message: "Invalid or expired verification token." };
    }
  },

  async requestVerification(userId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) throw { status: 404, message: "User not found." };
    
    const token = jwt.sign({ id: user.id }, config.jwtSecret as any, { expiresIn: "24h" as any });
    logger.info(`Email verification token requested for user ID ${userId}: ${token}`);
    
    return {
      message: "Verification email sent.",
      verificationToken: token // Include for easy sandbox manual verification
    };
  }
};
import { prisma } from "../../../config/db.js";
