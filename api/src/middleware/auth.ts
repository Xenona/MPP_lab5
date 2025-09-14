import { Request, Response, NextFunction } from 'express';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { userService } from '../services/userService';
import type {StringValue} from "ms";

export const JWT_SECRET: Secret = process.env.JWT_SECRET || 'replace_this_with_secure_secret';

export interface JwtPayloadApp {
    userId: string;
    username: string;
    iat?: number;
    exp?: number;
}

export function signJwt(userId: string, username: string, expiresIn: StringValue = '1h') : string {
    const payload: JwtPayloadApp = { userId, username };

    const options: SignOptions = {
        expiresIn,
    };

    return jwt.sign(payload, JWT_SECRET, options);
}

export function authMiddleware(
    req: Request & { user?: { id: string; username: string } },
    res: Response,
    next: NextFunction
) {

    const bearerHeader = 'Bearer ';

    const token =
        req.cookies?.token ||
        (req.headers.authorization?.startsWith(bearerHeader)
            ? req.headers.authorization.slice(bearerHeader.length)
            : undefined);

    if (!token) return res.status(401).json({ error: 'No token' });

    try {
        const payload = jwt.verify(token, JWT_SECRET) as JwtPayloadApp;

        const user = userService.getById(payload.userId);
        if (!user) return res.status(401).json({ error: 'User not found' });

        req.user = { id: user.id, username: user.username };
        next();
    } catch (e) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}
