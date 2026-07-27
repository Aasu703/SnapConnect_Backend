import { CreateUserDTO, LoginUserDTO, UpdateUserDto } from "../../dtos/user/user.dto";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { HttpError } from "../../errors/http-error";
import jwt from "jsonwebtoken";
import {  JWT_SECRET, } from "../../config";
import { UserRepository } from "../../repositories/user/user.repository";
import { sendPasswordResetOtp } from "../mail/mailer.service";


const CLIENT_URL = process.env.CLIENT_URL as string;

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;

export class UserService {
    constructor(private userRepository = new UserRepository()) {}

    private issueToken(user: Record<string, any>) {
        const payload = {
            id: user._id,
            email: user.email,
            Firstname: user.Firstname,
            Lastname: user.Lastname,
            role: user.role,
            phone: user.phone,
        };
        return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
    }

    private sanitizeUser(user: Record<string, any>) {
        const plain = typeof user.toObject === "function" ? user.toObject() : user;
        // toObject() bypasses the schema's toJSON transform, so strip the same
        // credential fields here.
        const {
            password,
            resetOtp,
            resetOtpExpiresAt,
            resetOtpAttempts,
            ...safeUser
        } = plain;
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
        const token = this.issueToken(user as unknown as Record<string, any>);
        return { token, user: this.sanitizeUser(user as unknown as Record<string, any>) };
    }

    /// Emails a one-time code for password reset.
    ///
    /// Resolves the same way whether or not the address is registered — a
    /// different response would let anyone enumerate accounts by email.
    async requestPasswordReset(email: string) {
        const user = await this.userRepository.getUserByEmail(email);
        if (!user) {
            return;
        }

        // crypto.randomInt is uniform and CSPRNG-backed; Math.random is neither
        // and must not generate credentials.
        const otp = crypto.randomInt(0, 10 ** OTP_LENGTH)
            .toString()
            .padStart(OTP_LENGTH, "0");

        // Stored hashed so a database read can't be replayed as a valid reset.
        const otpHash = await bcryptjs.hash(otp, 10);

        await this.userRepository.updateUserById(user.id, {
            resetOtp: otpHash,
            resetOtpExpiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
            resetOtpAttempts: 0,
        });

        try {
            await sendPasswordResetOtp(user.email, otp, OTP_TTL_MINUTES);
        } catch (error) {
            // Must not propagate: an SMTP failure here would return a 500 for
            // registered addresses while unknown ones still return 200, which
            // is exactly the account enumeration this endpoint avoids.
            console.error(`[auth] Failed to send reset OTP to ${user.email}:`, error);
        }
    }

    /// Validates an OTP and consumes it, returning the owning user.
    private async consumeResetOtp(email: string, otp: string) {
        const user = await this.userRepository.getUserByEmail(email);
        if (!user || !user.resetOtp || !user.resetOtpExpiresAt) {
            throw new HttpError(400, "Invalid or expired code");
        }

        // The schema types this as string | Date, so normalize before comparing.
        const expiresAt = new Date(user.resetOtpExpiresAt);
        if (expiresAt.getTime() < Date.now()) {
            await this.clearResetOtp(user.id);
            throw new HttpError(400, "Invalid or expired code");
        }

        const attempts = user.resetOtpAttempts ?? 0;
        if (attempts >= OTP_MAX_ATTEMPTS) {
            await this.clearResetOtp(user.id);
            throw new HttpError(429, "Too many incorrect attempts. Request a new code.");
        }

        const matches = await bcryptjs.compare(otp, user.resetOtp);
        if (!matches) {
            await this.userRepository.updateUserById(user.id, {
                resetOtpAttempts: attempts + 1,
            });
            throw new HttpError(400, "Invalid or expired code");
        }

        return user;
    }

    private async clearResetOtp(userId: string) {
        await this.userRepository.clearResetOtp(userId);
    }

    /// Checks an OTP without consuming it, so the app can advance to the
    /// new-password step before the user commits.
    async verifyPasswordResetOtp(email: string, otp: string) {
        await this.consumeResetOtp(email, otp);
    }

    /// Completes a reset: validates the OTP, sets the new password, and
    /// invalidates the code so it can't be reused.
    async resetPasswordWithOtp(email: string, otp: string, newPassword: string) {
        const user = await this.consumeResetOtp(email, otp);

        const hashedPassword = await bcryptjs.hash(newPassword, 10);
        await this.userRepository.setPasswordAndClearOtp(user.id, hashedPassword);
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