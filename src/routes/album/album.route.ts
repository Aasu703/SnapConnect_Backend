
import { Router } from "express";
import { AlbumController } from "../../controller/album/album.controller";
import { asyncHandler } from "../../middleware/async-handler.middlerware";

const router = Router();
const controller = new AlbumController();

router.post("/", asyncHandler((req, res) => controller.createAlbum(req, res)));
router.get("/:id", asyncHandler((req, res) => controller.getAlbum(req, res)));
router.get("/user/:userId", asyncHandler((req, res) => controller.getUserAlbums(req, res)));

export default router;
