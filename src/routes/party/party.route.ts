
import { Router } from "express";
import { PartyController } from "../../controller/party/party.controller";
import { asyncHandler } from "../../middleware/async-handler.middlerware";

const router = Router();
const controller = new PartyController();

router.post("/", asyncHandler((req, res) => controller.createParty(req, res)));
router.get("/", asyncHandler((req, res) => controller.getAllParties(req, res)));
router.post("/join", asyncHandler((req, res) => controller.joinParty(req, res)));
router.get("/:id", asyncHandler((req, res) => controller.getParty(req, res)));
router.get("/code/:code", asyncHandler((req, res) => controller.getPartyByJoinCode(req, res)));
router.get("/host/:userId", asyncHandler((req, res) => controller.getHostParties(req, res)));
router.get("/joined/:userId", asyncHandler((req, res) => controller.getJoinedParties(req, res)));

export default router;
