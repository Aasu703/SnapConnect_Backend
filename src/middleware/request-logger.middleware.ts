import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";

const REDACTED = "[REDACTED]";
const SENSITIVE_KEYS = ["password", "token", "accessToken", "refreshToken", "authorization", "otp", "secret"];

function redact(payload: unknown): unknown {
    if (Array.isArray(payload)) {
        return payload.map(redact);
    }
    if (payload && typeof payload === "object") {
        const clone: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
            clone[key] = SENSITIVE_KEYS.includes(key.toLowerCase()) ? REDACTED : redact(value);
        }
        return clone;
    }
    return payload;
}

// Logs every incoming request (with its payload) and the resulting status/duration,
// so failing requests can be traced from a single pair of log lines.
export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    logger.info(`--> ${req.method} ${req.originalUrl}`, {
        params: req.params,
        query: req.query,
        body: redact(req.body),
    });

    res.on("finish", () => {
        const duration = Date.now() - start;
        logger.info(`<-- ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
    });

    next();
}
