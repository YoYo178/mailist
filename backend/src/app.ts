import express, { type Express, type Request, type Response } from 'express';

import errorHandler from './middlewares/errorHandler.middleware.js';

// Express application
const app: Express = express();

app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({ message: 'Working!' });
})

// Attach error handler middleware
app.use(errorHandler);

export default app;
