
import { Router } from "express";
import { PhotoController } from "../../controller/photo/photo.controller";
import { upload } from "../../middleware/multer.middleware";
import { asyncHandler } from "../../middleware/async-handler.middlerware";

const router = Router();
const controller = new PhotoController();

router.post("/upload", upload.single("file"), asyncHandler((req, res) => controller.uploadPhoto(req, res)));
router.get("/album/:album_id", asyncHandler((req, res) => controller.getPhotosByAlbum(req, res)));
router.delete("/:id", asyncHandler((req, res) => controller.deletePhoto(req, res)));

export default router;
