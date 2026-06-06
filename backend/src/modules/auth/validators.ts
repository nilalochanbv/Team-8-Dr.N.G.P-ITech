import { z } from "zod";

export const SignupSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  fullName: z.string().min(2, "Full name must be at least 2 characters long"),
  role: z.enum([
    "STUDENT",
    "MENTOR",
    "RECRUITER",
    "COMPANY",
    "COLLEGE_ADMIN",
    "SUPER_ADMIN"
  ], {
    errorMap: () => ({ message: "Invalid role specified" })
  })
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required")
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required")
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format")
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters")
});
