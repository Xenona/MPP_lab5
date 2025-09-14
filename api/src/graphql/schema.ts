import {makeExecutableSchema} from '@graphql-tools/schema';
import {userService} from '../services/userService';
import taskService from '../services/taskService';
import type {JwtPayloadApp} from '../middleware/auth';
import {JWT_SECRET} from '../middleware/auth';
import jwt from 'jsonwebtoken';
import {Status, TaskFilter, TimeFilter} from "../models/task";

interface Context {
    user?: { id: string; username: string };
    res?: {
        cookie: (name: string, value: string, options: any) => void;
        clearCookie: (name: string, options: any) => void;
    };
}

interface TaskInput {
    title: string;
    description?: string;
    status?: Status;
    dueDate?: string;
}

interface RegisterInput {
    username: string;
    password: string;
}

interface LoginInput {
    username: string;
    password: string;
}

export const typeDefs =
    `
  enum Status {
    TODO
    IN_PROGRESS
    DONE
  }

  enum TimeFilter {
    any
    overdue
    today
    week
    month
  }

  enum TaskFilter {
    all
    active
    completed
  }

  type Attachment {
    filename: String!
    originalName: String!
  }

  type Task {
    id: ID!
    ownerId: ID!
    title: String!
    description: String
    status: Status!
    dueDate: String
    attachments: [Attachment!]!
  }

  type User {
    id: ID!
    username: String!
    createdAt: String!
  }

  input TaskInput {
    title: String!
    description: String
    status: Status
    dueDate: String
  }

  type LoginResult {
    id: ID!
    username: String!
  }

  type Query {
    me: User
    tasks(filter: TaskFilter = all, time: TimeFilter = any): [Task!]!
    task(id: ID!): Task
  }

  type Mutation {
    register(username: String!, password: String!): User!
    login(username: String!, password: String!): LoginResult!
    logout: Boolean!
    createTask(input: TaskInput!): Task!
    updateTask(id: ID!, input: TaskInput!): Task
    deleteTask(id: ID!): Boolean!
  }
`;

export const resolvers = {
    Status: {
        TODO: 'todo',
        IN_PROGRESS: 'in progress',
        DONE: 'done'
    },

    Query: {
        me: (_: unknown, __: unknown, ctx: Context) => {
            return ctx.user ?? null;
        },
        tasks: (_: unknown, args: { filter: TaskFilter; time: TimeFilter }, ctx: Context) => {
            if (!ctx.user) throw new Error('Unauthorized');
            return taskService.getAllTasksForUser(ctx.user.id, args.filter, args.time);
        },
        task: (_: unknown, { id }: { id: string }, ctx: Context) => {
            if (!ctx.user) throw new Error('Unauthorized');
            return taskService.getTaskByIdForUser(id, ctx.user.id) ?? null;
        },
    },
    Mutation: {
        register: async (_: unknown, { username, password }: RegisterInput, ctx: Context) => {
            const u = await userService.createUser(username, password);
            const token = jwt.sign(
                { userId: u.id, username: u.username } as JwtPayloadApp,
                JWT_SECRET,
                { expiresIn: '2h' }
            );

            try {
                ctx.res?.cookie('token', token, {
                    httpOnly: true,
                    sameSite: 'lax',
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 2 * 60 * 60 * 1000,
                    path: '/',
                });
            } catch (e) {
                console.log(e)
            }

            return { id: u.id, username: u.username, createdAt: u.createdAt };
        },

        login: async (_: unknown, { username, password }: LoginInput, ctx: Context) => {
            const user = await userService.validatePassword(username, password);
            if (!user) throw new Error('Invalid credentials');

            const token = jwt.sign(
                { userId: user.id, username: user.username } as JwtPayloadApp,
                JWT_SECRET,
                { expiresIn: '2h' }
            );

            try {
                ctx.res?.cookie('token', token, {
                    httpOnly: true,
                    sameSite: 'lax',
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 2 * 60 * 60 * 1000,
                    path: '/',
                });
            } catch (e) {}

            return { id: user.id, username: user.username };
        },

        logout: (_: unknown, __: unknown, ctx: Context) => {
            try {
                ctx.res?.clearCookie('token', { path: '/' });
            } catch (e) {}
            return true;
        },

        createTask: (_: unknown, { input }: { input: TaskInput }, ctx: Context) => {
            if (!ctx.user) throw new Error('Unauthorized');
            return taskService.createTaskForUser(ctx.user.id, {
                title: input.title,
                description: input.description,
                status: input.status || 'todo',
                dueDate: input.dueDate ? new Date(input.dueDate).toISOString() : undefined,
            });
        },

        updateTask: (_: unknown, { id, input }: { id: string; input: TaskInput }, ctx: Context) => {
            if (!ctx.user) throw new Error('Unauthorized');
            const updated = taskService.updateTaskForUser(id, ctx.user.id, {
                title: input.title,
                description: input.description,
                status: input.status,
                dueDate: input.dueDate ? new Date(input.dueDate).toISOString() : undefined,
            });
            return updated ?? null;
        },

        deleteTask: (_: unknown, { id }: { id: string }, ctx: Context) => {
            if (!ctx.user) throw new Error('Unauthorized');
            return taskService.deleteTaskForUser(id, ctx.user.id);
        },
    },
};

export const schema = makeExecutableSchema({ typeDefs, resolvers });
