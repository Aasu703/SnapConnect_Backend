import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    
    // Log incoming request
    logger.info(`[REQUEST] ${req.method} ${req.originalUrl}`);
    
    if (req.body && Object.keys(req.body).length > 0) {
        // Clone body to avoid mutating it, and mask sensitive fields if necessary
        const bodyToLog = { ...req.body };
        if (bodyToLog.password) bodyToLog.password = '[HIDDEN]';
        logger.info(`[PAYLOAD]`, bodyToLog);
    }
    
    if (req.query && Object.keys(req.query).length > 0) {
        logger.info(`[QUERY]`, req.query);
    }

    // Intercept response to log it
    const originalSend = res.send;
    res.send = function (data) {
        const duration = Date.now() - start;
        logger.info(`[RESPONSE] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - ${duration}ms`);
        
        try {
            // Try to parse the stringified JSON data for pretty logging
            const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
            logger.info(`[DATA]`, parsedData);
        } catch (e) {
            // If it's not JSON (e.g. HTML, Buffer), log it as is (or truncate if too large)
            if (typeof data === 'string' && data.length > 500) {
                logger.info(`[DATA] <Data too long, length: ${data.length}>`);
            } else {
                logger.info(`[DATA]`, data);
            }
        }
        
        // Call the original send function
        return originalSend.apply(res, arguments as any);
    };

    next();
};
