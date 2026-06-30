
import mongoose from 'mongoose';

const reactionSchema = new mongoose.Schema({
    photo_id: { type: String, required: true },
    user_id: { type: String, required: true },
    user_name: { type: String, required: true },
    emoji: { type: String, required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

reactionSchema.virtual('id').get(function() { return (this as any)._id.toHexString(); });
reactionSchema.set('toJSON', { virtuals: true });

export const Reaction = mongoose.model('Reaction', reactionSchema);
