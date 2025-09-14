import {createYoga} from 'graphql-yoga';
import {schema} from './schema';
import jwt from 'jsonwebtoken';
import type {JwtPayloadApp} from '../middleware/auth';
import {JWT_SECRET} from '../middleware/auth';
import {userService} from '../services/userService';

function extractTokenFromRequest(req: Request): string | undefined {
    const auth = req.headers.get('authorization') ?? undefined;
    const bearer = 'Bearer ';
    if (auth && auth.startsWith(bearer)) return auth.slice(bearer.length);

    const cookie = req.headers.get('cookie') ?? '';
    const match = cookie.match(/token=([^;]+)/);
    if (match) return match[1];
    return undefined;
}

export function createGraphqlMiddleware() {
    return createYoga({
        schema,
        graphiql: process.env.NODE_ENV !== 'production',

        context: async (ctx: any) => {
            const token = extractTokenFromRequest(ctx.request);
            let user = null;
            if (token) {
                try {
                    const payload = jwt.verify(token, JWT_SECRET) as JwtPayloadApp;
                    const u = userService.getById(payload.userId);
                    if (u) {
                        user = { id: u.id, username: u.username, createdAt: u.createdAt };
                    }
                } catch (e) {
                    console.log(e)
                }
            }

            return {
                user,
                req: (ctx as any).req,
                res: (ctx as any).res
            };
        }
    });
}
