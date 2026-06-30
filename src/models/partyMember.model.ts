
import mongoose from 'mongoose';

const partyMemberSchema = new mongoose.Schema({
    party_id: { type: String, required: true },
    user_id: { type: String, required: true },
    user_name: { type: String, required: true },
    joined_at: { type: Date, default: Date.now },
});

partyMemberSchema.virtual('id').get(function() { return (this as any)._id.toHexString(); });
partyMemberSchema.set('toJSON', { virtuals: true });

export const PartyMember = mongoose.model('PartyMember', partyMemberSchema);
