import { Router } from "express";
import { authController } from "./controllers/auth.controller.js";
import { validateSchema } from "../../middleware/validation.js";
import { SignupSchema, LoginSchema, RefreshTokenSchema, ForgotPasswordSchema, ResetPasswordSchema } from "./validators.js";
import { authRateLimiter } from "../../middleware/rateLimiter.js";

const router = Router();

router.post("/signup", authRateLimiter, validateSchema(SignupSchema), authController.register);
router.post("/login", authRateLimiter, validateSchema(LoginSchema), authController.login);
router.post("/logout", validateSchema(RefreshTokenSchema), authController.logout);
router.post("/refresh", validateSchema(RefreshTokenSchema), authController.refresh);
router.post("/forgot-password", validateSchema(ForgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", validateSchema(ResetPasswordSchema), authController.resetPassword);
router.get("/verify-email", authController.verifyEmail);

export default router;
