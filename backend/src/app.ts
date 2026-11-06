import express, { type Express, type Request, type Response } from 'express';

import { sessionMiddleware } from './infrastructure/session/index.js';
import errorHandler from './middlewares/errorHandler.middleware.js';

// Express application
const app: Express = express();

// Attach JSON body parser middleware
app.use(express.json());

// Attach session middleware
app.use(sessionMiddleware);

app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({ message: 'Working!' });
})

// Attach error handler middleware
app.use(errorHandler);

export default app;
