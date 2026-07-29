
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
            const data = await this.withPhotoCounts(albums);
            return res.status(200).json({ success: true, data });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async getPublicAlbums(req: Request, res: Response) {
        try {
            const albums = await Album.find({ is_private: false });
            const data = await this.withPhotoCounts(albums);
            return res.status(200).json({ success: true, data });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /// Attaches a live photo_count to each album. The field stored on the
    /// document is never incremented on upload, so it can't be trusted as-is —
    /// this recomputes it from the Photo collection in one grouped query
    /// instead of N+1 counts per album.
    private async withPhotoCounts(albums: Array<InstanceType<typeof Album>>) {
        const albumIds = albums.map((album) => album.id);
        const counts = await Photo.aggregate([
            { $match: { album_id: { $in: albumIds } } },
            { $group: { _id: "$album_id", count: { $sum: 1 } } },
        ]);
        const countByAlbumId = new Map(counts.map((c) => [c._id, c.count]));

        return albums.map((album) => {
            const albumData = album.toJSON();
            albumData.photo_count = countByAlbumId.get(album.id) ?? 0;
            return albumData;
        });
    }
}
