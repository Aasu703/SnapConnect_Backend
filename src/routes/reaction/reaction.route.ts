
import { Router } from "express";
import { ReactionController } from "../../controller/reaction/reaction.controller";
import { asyncHandler } from "../../middleware/async-handler.middlerware";

const router = Router();
const controller = new ReactionController();

router.post("/toggle", asyncHandler((req, res) => controller.toggleReaction(req, res)));
router.get("/photo/:photo_id", asyncHandler((req, res) => controller.getReactionsForPhoto(req, res)));

export default router;
