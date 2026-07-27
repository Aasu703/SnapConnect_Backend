import z from "zod";

export const UserSchema = z.object({
    id: z.string().uuid().optional(),
    Firstname: z.string().min(2),
    Lastname: z.string().min(2),
    email: z.string().email(),
    // Optional because Google-provisioned accounts have no local password.
    password: z.string().min(8).optional(),
    authProvider: z.enum(["local", "google"]).default("local"),
    phone: z.string().min(10).optional(),
    role: z.enum(["user", "admin"]).default("user"),
    imageUrl: z.string().optional(), // for image URL storage
    avatarUrl: z.string().optional(),
    createdAt: z.string().optional(),
    resetOtp: z.string().optional(),
    resetOtpExpiresAt: z.union([z.string(), z.date()]).optional(),
    resetOtpAttempts: z.number().optional()

});

export type UserType = z.infer<typeof UserSchema>;