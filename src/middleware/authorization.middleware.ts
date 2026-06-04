import { Request,Response,NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "../config";
import{IUser} from '../models/user/user.model';

import { UserRepository } from "../repositories/user/user.repository";

import { HttpError } from "../errors/http-error";

// Extend Express Request to include user and provider properties
declare global {
    namespace Express {
        interface Request {
            user?: IUser | any;
            provider?: any;
        }
    }
}

let userRepository=new UserRepository();

//can use req.user in other files

export async function authorizedMiddleware(req:Request,res:Response,next:NextFunction){
    try{
        let token: string | undefined;
        
        // Check Authorization header first
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } 
        // If no Authorization header, check for auth_token cookie
        else if (req.cookies && req.cookies.auth_token) {
            token = req.cookies.auth_token;
        }
        
        if (!token) {
            throw new HttpError(401, 'Authorization token missing');
        }
        
        const decoded = jwt.verify(token, JWT_SECRET) as Record<string, any>;//decoded -> payload
        if (!decoded || !decoded.id)
            throw new HttpError(401, 'Invalid token');

        // Basic validation: ensure decoded.id looks like a Mongo ObjectId when used for DB lookups
        const objectIdRegex = /^[a-fA-F0-9]{24}$/;
        if (decoded.role === 'provider' || decoded.role === 'user') {
            if (typeof decoded.id !== 'string' || !objectIdRegex.test(decoded.id)) {
                throw new HttpError(401, 'Invalid token payload');
            }
        }
        
        // Check if this is a provider token
        
        const user = await userRepository.getUserById(decoded.id);//make async if needed
        if (!user)
            throw new HttpError(401, 'User not found');
        req.user = user;
        return next();
    }
    catch(err: Error | any){
        return next(err instanceof HttpError ? err : new HttpError(401, err.message || 'Unauthorized'));
    }
            
}   

export async function adminMiddleware(req:Request,res:Response,next:NextFunction){
    try{
        const user=req.user;
        if(!user)
            throw new HttpError(401,'Unauthorized');
        if(user.role !== 'admin')
            throw new HttpError(403,'Forbidden: Admins only');
        return next();
    }
    catch(err: Error | any){
        return next(err instanceof HttpError ? err : new HttpError(500, err.message || 'Unauthorized'));
    }
}



export function requireRoles(...roles: Array<'user' | 'provider' | 'admin'>) {
    return (req: Request, res: Response, next: NextFunction) => {
        const role = (req.user as Record<string, unknown> | undefined)?.role;
        if (!role) {
            return next(new HttpError(401, 'Unauthorized'));
        }
        if (!roles.includes(role as 'user' | 'provider' | 'admin')) {
            return next(new HttpError(403, 'Forbidden'));
        }
        return next();
    };
}