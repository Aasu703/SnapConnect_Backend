
import mongoose from 'mongoose';

const albumSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    cover_url: { type: String },
    created_by: { type: String },
    created_by_name: { type: String },
    photo_count: { type: Number, default: 0 },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

albumSchema.virtual('id').get(function() { return (this as any)._id.toHexString(); });
albumSchema.set('toJSON', { virtuals: true });

export const Album = mongoose.model('Album', albumSchema);
