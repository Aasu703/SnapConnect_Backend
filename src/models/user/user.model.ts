import mongoose, {Document, Schema} from "mongoose";
import { UserType } from "../../types/user/user.type";

const UserSchema: Schema = new Schema<UserType>(
    {
        email: {type: String, required: true, unique: true, lowercase: true, trim: true, index: true},
        password: {type: String, required: true},
        Firstname: {type: String, required: true, trim: true},
        Lastname: {type: String, required: true, trim: true},
        phone: {type: String, index: true},
        role: {type: String, enum: ["user", "admin"], default: "user"},
        imageUrl: {type: String, required: false}, // for image URL storage
        resetOtp: { type: String, required: false },
        resetOtpExpiresAt: { type: Date, required: false },
        resetOtpAttempts: { type: Number, required: false, default: 0 }
    },
    {
        timestamps: true,
    }
    
);

UserSchema.index({ role: 1, createdAt: -1 });

UserSchema.virtual('id').get(function(this: IUser) {
    return this._id.toHexString();
});

// Ensure virtual fields are serialised
UserSchema.set('toJSON', {
    virtuals: true,
});

export interface IUser extends UserType, Document {
    id: string;
    _id: mongoose.Types.ObjectId;
}

export const UserModel = mongoose.model<IUser>("User", UserSchema);
// UserModel will be used to interact with the users collection in MongoDB
// It provides methods to create, read, update, and delete user documents
