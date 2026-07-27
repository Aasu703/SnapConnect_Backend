import { Router } from "express";
import rateLimit from "express-rate-limit";
import { AuthController } from "../../controller/user/user.controller";
import { authorizedMiddleware } from "../../middleware/authorization.middleware";
import { asyncHandler } from "../../middleware/async-handler.middlerware";

const router = Router();
const authController = new AuthController();

// Sending a reset code emails a real person and creates a credential, so cap
// it per IP to stop mailbox flooding and code-guessing at scale.
const passwordResetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many attempts. Try again later." },
});

router.post("/register", asyncHandler((req, res) => authController.register(req, res)));
router.post("/login", asyncHandler((req, res) => authController.login(req, res)));
router.post("/logout", asyncHandler((req, res) => authController.logout(req, res)));

router.post(
    "/forgot-password",
    passwordResetLimiter,
    asyncHandler((req, res) => authController.requestPasswordReset(req, res)),
);
router.post(
    "/verify-reset-otp",
    passwordResetLimiter,
    asyncHandler((req, res) => authController.verifyResetOtp(req, res)),
);
router.post(
    "/reset-password",
    passwordResetLimiter,
    asyncHandler((req, res) => authController.resetPassword(req, res)),
);

router.get('/whoami', authorizedMiddleware, asyncHandler((req, res) => authController.getUserProfile(req, res)));





export default router;