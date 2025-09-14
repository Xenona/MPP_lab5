import express from 'express';
import apiTasks from './routes/apiTasks';
import authRoutes from './routes/auth';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authMiddleware } from './middleware/auth';
import http from "http";
import {initSocket} from "./socket";
import {createGraphqlMiddleware} from "./graphql";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);

const yoga = createGraphqlMiddleware();
app.use('/graphql', (yoga as any));

app.use('/api/tasks', authMiddleware, apiTasks);

const server = http.createServer(app);
initSocket(server);

server.listen(port, () => {
    console.log(`API server listening on http://localhost:${port}`);
    console.log(`GraphQL API server listening on http://localhost:${port}${yoga.graphqlEndpoint}`);
});