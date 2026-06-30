
import { Request, Response } from "express";
import { Photo } from "../../models/photo.model";

export class PhotoController {
    async uploadPhoto(req: Request, res: Response) {
        try {
            const { album_id, title, uploaded_by, uploaded_by_name } = req.body;
            const file = req.file;
            
            if (!file) {
                return res.status(400).json({ success: false, message: "No file uploaded" });
            }

            const url = `/uploads/${file.filename}`;

            const photo = await Photo.create({
                album_id,
                url,
                title,
                uploaded_by,
                uploaded_by_name,
            });

            return res.status(201).json({ success: true, data: photo });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async getPhotosByAlbum(req: Request, res: Response) {
        try {
            const { album_id } = req.params;
            const photos = await Photo.find({ album_id }).sort({ created_at: -1 });
            return res.status(200).json({ success: true, data: photos });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async deletePhoto(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await Photo.findByIdAndDelete(id);
            return res.status(200).json({ success: true, message: "Photo deleted" });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}
