
import mongoose from 'mongoose';

const photoSchema = new mongoose.Schema({
    album_id: { type: String, required: true },
    url: { type: String, required: true },
    title: { type: String },
    uploaded_by: { type: String, required: true },
    uploaded_by_name: { type: String, required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Virtual id for flutter
photoSchema.virtual('id').get(function() {
    return (this as any)._id.toHexString();
});
photoSchema.set('toJSON', { virtuals: true });

export const Photo = mongoose.model('Photo', photoSchema);
