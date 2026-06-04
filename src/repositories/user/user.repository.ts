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

    async updateAdminRole(id: string, role: "user" | "admin" | "provider"): Promise<IUser | null> {
        return UserModel.findByIdAndUpdate(id, { role }, { new: true }).exec();
    }

}