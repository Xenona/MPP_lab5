import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import {User} from "../models/user";


export class UserService {
    private users = new Map<string, User>();

    async createUser(username: string, password: string): Promise<User> {
        if (this.users.has(username)) {
            throw new Error('UserExists');
        }

        const hash = await bcrypt.hash(password, 8);
        const user: User = {
            id: uuidv4(),
            username,
            passwordHash: hash,
            createdAt: new Date().toISOString()
        };
        this.users.set(username, user);
        return user;
    }

    getByUsername(username: string): User | undefined {
        return this.users.get(username);
    }

    getById(id: string): User | undefined {
        for (const u of this.users.values()) {
            if (u.id === id) return u;
        }
        return undefined;
    }

    async validatePassword(username: string, password: string): Promise<User | null> {
        const u = this.users.get(username);
        if (!u) return null;

        const ok = await bcrypt.compare(password, u.passwordHash);
        return ok ? u : null;
    }
}

export const userService = new UserService();
export default userService;
