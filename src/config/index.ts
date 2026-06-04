import dotenv from "dotenv";
import { z } from "zod/v4";
dotenv.config();

// Support both MONGODB_URI and MONGO_URI (common variants)
if (!process.env.MONGODB_URI && process.env.MONGO_URI) {
	process.env.MONGODB_URI = process.env.MONGO_URI;
}

const envSchema = z.object({
	PORT: z.coerce.number().int().positive().default(3000),
	MONGODB_URI: z.string().min(1, "MONGODB_URI or MONGO_URI is required"),
	JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
	NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
	CLIENT_URL: z.string().optional().default("http://localhost:3000"),
	EMAIL_USER: z.string().optional().default(""),
	EMAIL_PASS: z.string().optional().default(""),
	TWILIO_ACCOUNT_SID: z.string().optional().default(""),
	TWILIO_AUTH_TOKEN: z.string().optional().default(""),
	TWILIO_FROM_NUMBER: z.string().optional().default("")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
	console.error("❌ Invalid environment variables:", parsed.error.format());
	process.exit(1);
}

const env = parsed.data;

export const PORT: number = env.PORT;
export const MONGO_URI: string = env.MONGODB_URI;
export const JWT_SECRET: string = env.JWT_SECRET;
export const NODE_ENV: string = env.NODE_ENV;
export const CLIENT_URL: string = env.CLIENT_URL;
export const EMAIL_USER: string = env.EMAIL_USER;
export const EMAIL_PASS: string = env.EMAIL_PASS;
export const TWILIO_ACCOUNT_SID: string = env.TWILIO_ACCOUNT_SID;
export const TWILIO_AUTH_TOKEN: string = env.TWILIO_AUTH_TOKEN;
export const TWILIO_FROM_NUMBER: string = env.TWILIO_FROM_NUMBER;