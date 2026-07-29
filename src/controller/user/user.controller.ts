import { UserService } from "../../services/user/user.service";
import {
    CreateUserDTO,
    GoogleSignInDTO,
    LoginUserDTO,
    RequestPasswordResetDTO,
    ResetPasswordDTO,
    VerifyResetOtpDTO,
} from "../../dtos/user/user.dto";
import { Request, Response } from "express";
import z from "zod";
import { UserModel } from "../../models/user/user.model";


let userService = new UserService();
export class AuthController {
    async register(req: Request, res: Response) {
        try {
            const parsedData = CreateUserDTO.safeParse(req.body); // validate request body
            if (!parsedData.success) { // validation failed
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                )
            }
            const userData: CreateUserDTO = parsedData.data;
            const newUser = await userService.createUser(userData);
            return res.status(201).json(
                { success: true, message: "User Created", data: newUser }
            );
        } catch (error: Error | any) { 
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async login(req: Request, res: Response) {
        try {
            const parsedData = LoginUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                )
            }
            const loginData: LoginUserDTO = parsedData.data;
            const { token, user } = await userService.loginUser(loginData);
            
            res.cookie('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
            
            return res.status(200).json(
                { success: true, message: "Login successful", data: { user, accessToken: token }, token }
            );

        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async googleSignIn(req: Request, res: Response) {
        try {
            const parsedData = GoogleSignInDTO.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                );
            }
            const { token, user } = await userService.loginWithGoogle(parsedData.data.idToken);

            res.cookie('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            return res.status(200).json(
                { success: true, message: "Login successful", data: { user, accessToken: token }, token }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async requestPasswordReset(req: Request, res: Response) {
        try {
            const parsedData = RequestPasswordResetDTO.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                );
            }
            await userService.requestPasswordReset(parsedData.data.email);
            // Deliberately identical whether or not the email is registered,
            // so this endpoint can't be used to enumerate accounts.
            return res.status(200).json(
                { success: true, message: "If that email is registered, a reset code is on its way." }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async verifyResetOtp(req: Request, res: Response) {
        try {
            const parsedData = VerifyResetOtpDTO.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                );
            }
            const { email, otp } = parsedData.data;
            await userService.verifyPasswordResetOtp(email, otp);
            return res.status(200).json(
                { success: true, message: "Code verified" }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async resetPassword(req: Request, res: Response) {
        try {
            const parsedData = ResetPasswordDTO.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                );
            }
            const { email, otp, password } = parsedData.data;
            await userService.resetPasswordWithOtp(email, otp, password);
            return res.status(200).json(
                { success: true, message: "Password updated. You can sign in now." }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async getUserProfile(req: Request, res: Response) {
        try {
            const userId = req.user?._id;
            if(!userId){
                return res.status(401).json(
                    { success: false, message: "Unauthorized" }
                )
            }
            const user = await userService.getUserById(userId);
            return res.status(200).json(
                { success: true, data: user, message: "User profile fetched successfully" }
            )
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async makeAdmin(req: Request, res: Response) {
        try {
            const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const updatedUser = await userService.makeAdmin(userId);
            return res.status(200).json(
                { success: true, message: "User promoted to admin", data: updatedUser }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

   async updateUser(req: Request, res: Response) {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const userId = req.user._id;
        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Update other profile fields if needed
        if (req.body.Firstname) user.Firstname = req.body.Firstname;
        if (req.body.Lastname) user.Lastname = req.body.Lastname;
        if (req.body.email) user.email = req.body.email;
        if (req.body.PhoneNumber) user.phone = req.body.PhoneNumber;
        if (req.body.phone) user.phone = req.body.phone;

        await user.save();

        const userObject = user.toObject() as unknown as Record<string, unknown>;
        delete userObject.password;

        res.json({
            success: true,
            message: 'Profile updated successfully.',
            data: userObject,
        });
    } catch (err: any) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
    }

    async updateProfilePhoto(req: Request, res: Response) {
        try {
            const { userId } = req.body;
            const file = req.file;

            if (!userId) {
                return res.status(400).json({ success: false, message: "userId is required" });
            }
            if (!file) {
                return res.status(400).json({ success: false, message: "No file uploaded" });
            }

            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            user.imageUrl = `/uploads/${file.filename}`;
            await user.save();

            const userObject = user.toObject() as unknown as Record<string, unknown>;
            delete userObject.password;

            return res.status(200).json({
                success: true,
                message: "Profile photo updated",
                data: userObject,
            });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async logout(req: Request, res: Response) {
        try {
            // Clear the auth_token cookie
            res.clearCookie('auth_token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
            });
            
            return res.status(200).json(
                { success: true, message: "Logged out successfully" }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }
}
