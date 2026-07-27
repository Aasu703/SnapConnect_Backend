import { UserModel, IUser } from "../../models/user/user.model";
import { CreateUserDTO } from "../../dtos/user/user.dto";

export class UserRepository {
    async createUser(data: CreateUserDTO): Promise<IUser> {
        const user = await UserModel.create({
            email: data.email,
            password: data.password,
            Firstname: data.Firstname,
            Lastname: data.Lastname,
            phone: data.phone,
            role: data.role
        });
        return user;
    }

    /// Provisions an account for a verified Google identity. Deliberately has
    /// no password field — email/password login rejects these accounts.
    async createGoogleUser(data: {
        email: string;
        Firstname: string;
        Lastname: string;
        imageUrl?: string;
    }): Promise<IUser> {
        return UserModel.create({
            email: data.email,
            Firstname: data.Firstname,
            Lastname: data.Lastname,
            imageUrl: data.imageUrl,
            authProvider: "google",
            role: "user",
        });
    }

    async getUserByEmail(email: string): Promise<IUser | null> {
        return UserModel.findOne({ email }).exec();
    }

    async getUserByPhone(phone: string): Promise<IUser | null> {
        return UserModel.findOne({ phone }).exec();
    }

    async getUserByFullName(fullName: string): Promise<IUser | null> {
        return UserModel.findOne({ fullName }).exec();
    }
    async getAllUsers(page: number = 1, limit: number = 10){
        const skip = (page - 1) * limit;
        const users = await UserModel.find().skip(skip).limit(limit);
        const total = await UserModel.countDocuments();
        return {
            users,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    async getUserById(id: string): Promise<IUser | null> {
        return UserModel.findById(id).exec();
    }

    async updateUserById(
        id: string,
        updates: Partial<Pick<IUser,
            "email" | "password" | "Firstname" | "Lastname" |
            "phone" | "role" | "imageUrl" | "resetOtp" |
            "resetOtpExpiresAt" | "resetOtpAttempts">
        >,
    ): Promise<IUser | null> {
        return UserModel.findByIdAndUpdate(id, updates, { new: true }).exec();
    }

    async deleteUserById(id: string): Promise<IUser | null> {
        return UserModel.findByIdAndDelete(id).exec();
    }

    /// Removes reset-OTP state. Uses $unset because Mongoose strips
    /// `undefined` values from update objects, so assigning undefined via
    /// updateUserById would silently leave a consumed OTP still valid.
    async clearResetOtp(id: string): Promise<IUser | null> {
        return UserModel.findByIdAndUpdate(
            id,
            { $unset: { resetOtp: "", resetOtpExpiresAt: "" }, $set: { resetOtpAttempts: 0 } },
            { new: true },
        ).exec();
    }

    /// Sets a new password and clears reset-OTP state in one atomic update, so
    /// a consumed code can never outlive the password it reset.
    async setPasswordAndClearOtp(id: string, hashedPassword: string): Promise<IUser | null> {
        return UserModel.findByIdAndUpdate(
            id,
            {
                $set: { password: hashedPassword, resetOtpAttempts: 0 },
                $unset: { resetOtp: "", resetOtpExpiresAt: "" },
            },
            { new: true },
        ).exec();
    }

    async updateAdminRole(id: string, role: "user" | "admin" | "provider"): Promise<IUser | null> {
        return UserModel.findByIdAndUpdate(id, { role }, { new: true }).exec();
    }

}