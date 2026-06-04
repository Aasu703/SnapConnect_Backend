import { CreateUserDTO, LoginUserDTO, UpdateUserDto } from "../../dtos/user/user.dto";
import bcryptjs from "bcryptjs";
import { HttpError } from "../../errors/http-error";
import jwt from "jsonwebtoken";
import {  JWT_SECRET, } from "../../config";
import { UserRepository } from "../../repositories/user/user.repository";


const CLIENT_URL = process.env.CLIENT_URL as string;

export class UserService {
    constructor(private userRepository = new UserRepository()) {}

    private sanitizeUser(user: Record<string, any>) {
        const plain = typeof user.toObject === "function" ? user.toObject() : user;
        const { password, ...safeUser } = plain;
        return safeUser;
    }

    async createUser(data: CreateUserDTO){
        const emailCheck = await this.userRepository.getUserByEmail(data.email);
        if(emailCheck){
            throw new HttpError(403, "Email is already in use");
        }
        const hashedPassword = await bcryptjs.hash(data.password, 10)
        data.password = hashedPassword;

        const newUser = await this.userRepository.createUser(data);
        return this.sanitizeUser(newUser as unknown as Record<string, any>);
    }

    async loginUser(data: LoginUserDTO){
        const user = await this.userRepository.getUserByEmail(data.email);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        const validPassword = await bcryptjs.compare(data.password, user.password);
        if(!validPassword){
            throw new HttpError(401, "Invalid credentials");
        }
        const payload = {
            id: user._id,
            email:user.email,
            Firstname:user.Firstname,
            Lastname:user.Lastname,
            role: user.role,
            phone:user.phone
        }
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
        return { token, user: this.sanitizeUser(user as unknown as Record<string, any>) };
    }

    async getUserById(userId: string){
        if(!userId){
            throw new HttpError(400, "User ID is required");
        }
        const user = await this.userRepository.getUserById(userId);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        return user;
    }
    async makeAdmin(userId: string){
        if(!userId){
            throw new HttpError(400, "User ID is required");
        }
        const user = await this.userRepository.getUserById(userId);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        user.role = "admin";
        const updatedUser = await this.userRepository.updateAdminRole(userId, "admin");
        return updatedUser;
    }

    async updateUser(userId: string, data: UpdateUserDto){
        const user = await this.userRepository.getUserById(userId);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        if(data.email && user.email !== data.email){
            const emailExists = await this.userRepository.getUserByEmail(data.email);
            if(emailExists){
                throw new HttpError(409, "Email already exists");
            }
        }
        if(data.password){
            const hashedPassword = await bcryptjs.hash(data.password, 10);
            data.password = hashedPassword;
        }
        const updatedUser = await this.userRepository.updateUserById(userId, data);
        return updatedUser;
    }
}