/**
 * Lightweight application logger.
 * Wraps console methods behind a unified API so the transport
 * can be swapped (e.g. to Winston / Pino) without touching call-sites.
 */
const logger = {
    info: (message: string, ...args: unknown[]) => {
        console.log(`[INFO] ${message}`, ...args);
    },
    warn: (message: string, ...args: unknown[]) => {
        console.warn(`[WARN] ${message}`, ...args);
    },
    error: (message: string, ...args: unknown[]) => {
        console.error(`[ERROR] ${message}`, ...args);
    },
    debug: (message: string, ...args: unknown[]) => {
        if (process.env.NODE_ENV !== "production") {
            console.debug(`[DEBUG] ${message}`, ...args);
        }
    },
};

export default logger;
