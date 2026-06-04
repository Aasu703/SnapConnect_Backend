import { Router } from "express";
import { AuthController } from "../../controller/user/user.controller";
import { authorizedMiddleware } from "../../middleware/authorization.middleware";
import { asyncHandler } from "../../middleware/async-handler.middlerware";

const router = Router();
const authController = new AuthController();



router.post("/register", asyncHandler((req, res) => authController.register(req, res)));
router.post("/login", asyncHandler((req, res) => authController.login(req, res)));
router.post("/logout", asyncHandler((req, res) => authController.logout(req, res)));

router.get('/whoami', authorizedMiddleware, asyncHandler((req, res) => authController.getUserProfile(req, res)));





export default router;