import z from "zod";
import { UserSchema } from "../../types/user/user.type";

export const CreateUserDTO = UserSchema.pick(
    {
        Firstname: true,
        Lastname: true,
        email: true,
        password: true,
        phone: true,
        role: true
    }
).extend(
    {
        confirmPassword: z.string().min(8)
    }
).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "Please confirm the password",
        path: ["confirmPassword"]
    }
)

export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

export const LoginUserDTO = z.object({
    email: z.string().email().trim(),
    password: z.string().min(8)
});

export type LoginUserDTO = z.infer<typeof LoginUserDTO>;

export const UpdateUserDto = UserSchema.partial(); 
export type UpdateUserDto = z.infer<typeof UpdateUserDto>;