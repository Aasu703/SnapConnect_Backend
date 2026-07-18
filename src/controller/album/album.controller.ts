
import { Request, Response } from "express";
import { Album } from "../../models/album.model";
import { Photo } from "../../models/photo.model";

export class AlbumController {
    async createAlbum(req: Request, res: Response) {
        try {
            const album = await Album.create(req.body);
            return res.status(201).json({ success: true, data: album });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async getAlbum(req: Request, res: Response) {
        try {
            const album = await Album.findById(req.params.id);
            if (!album) return res.status(404).json({ success: false, message: "Album not found" });
            
            const photoCount = await Photo.countDocuments({ album_id: album.id });
            const albumData = album.toJSON();
            albumData.photo_count = photoCount;
            
            return res.status(200).json({ success: true, data: albumData });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async getUserAlbums(req: Request, res: Response) {
        try {
            const albums = await Album.find({ created_by: req.params.userId });
            return res.status(200).json({ success: true, data: albums });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async getPublicAlbums(req: Request, res: Response) {
        try {
            const albums = await Album.find({ is_private: false });
            return res.status(200).json({ success: true, data: albums });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}
