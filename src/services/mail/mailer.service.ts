import nodemailer from "nodemailer";
import { EMAIL_USER, EMAIL_PASS } from "../../config";

/// Lazily-built transporter so the app still boots when email creds are absent
/// (local dev): send attempts then log instead of throwing.
let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
    if (!EMAIL_USER || !EMAIL_PASS) {
        return null;
    }
    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: EMAIL_USER, pass: EMAIL_PASS },
        });
    }
    return transporter;
}

export async function sendPasswordResetOtp(to: string, otp: string, expiresInMinutes: number) {
    const mailer = getTransporter();

    if (!mailer) {
        // Without credentials the OTP would be unrecoverable, so surface it in
        // the server log to keep local dev usable.
        console.warn(`[mailer] EMAIL_USER/EMAIL_PASS not set — reset OTP for ${to} is ${otp}`);
        return;
    }

    await mailer.sendMail({
        from: `"SnapConnect" <${EMAIL_USER}>`,
        to,
        subject: "Your SnapConnect password reset code",
        text:
            `Your password reset code is ${otp}\n\n` +
            `It expires in ${expiresInMinutes} minutes. ` +
            `If you didn't request this, you can ignore this email.`,
        html:
            `<p>Your password reset code is:</p>` +
            `<p style="font-size:28px;font-weight:700;letter-spacing:6px;margin:16px 0">${otp}</p>` +
            `<p>It expires in ${expiresInMinutes} minutes. ` +
            `If you didn't request this, you can ignore this email.</p>`,
    });
}
