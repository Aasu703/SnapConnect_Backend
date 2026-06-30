
import mongoose from 'mongoose';

const partySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    host_id: { type: String, required: true },
    host_name: { type: String, required: true },
    join_code: { type: String, required: true },
    album_id: { type: String, required: true },
    is_active: { type: Boolean, default: true },
    expires_at: { type: Date },
    member_count: { type: Number, default: 0 },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

partySchema.virtual('id').get(function() { return (this as any)._id.toHexString(); });
partySchema.set('toJSON', { virtuals: true });

export const Party = mongoose.model('Party', partySchema);
