
import { Request, Response } from "express";
import { Reaction } from "../../models/reaction.model";

export class ReactionController {
    async toggleReaction(req: Request, res: Response) {
        try {
            const { photo_id, user_id, user_name, emoji } = req.body;

            if (!photo_id || !user_id || !emoji) {
                return res.status(400).json({ success: false, message: "photo_id, user_id and emoji are required" });
            }

            const existing = await Reaction.findOne({ photo_id, user_id });

            if (existing && existing.get('emoji') === emoji) {
                // Same emoji tapped again: un-react.
                await existing.deleteOne();
            } else if (existing) {
                // Different emoji: a user may only have one reaction per photo.
                existing.set('emoji', emoji);
                existing.set('user_name', user_name);
                await existing.save();
            } else {
                await Reaction.create({ photo_id, user_id, user_name, emoji });
            }

            const reactions = await Reaction.find({ photo_id }).sort({ created_at: 1 });
            return res.status(200).json({ success: true, data: reactions });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async getReactionsForPhoto(req: Request, res: Response) {
        try {
            const { photo_id } = req.params;
            const reactions = await Reaction.find({ photo_id }).sort({ created_at: 1 });
            return res.status(200).json({ success: true, data: reactions });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}
