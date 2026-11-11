import express, { Router, type Express } from 'express';

import authRouter from '@/modules/auth/auth.routes.js';
import integrationsRouter from '@/modules/integrations/integration.routes.js';
import { sessionMiddleware } from './infrastructure/session/index.js';
import errorHandler from './middlewares/errorHandler.middleware.js';

// API Router
const apiRouter = Router();
apiRouter.use('/auth', authRouter);
apiRouter.use('/integrations', integrationsRouter);

// Express application
const app: Express = express();

// Attach JSON body parser middleware
app.use(express.json());

// Attach session middleware
app.use(sessionMiddleware);

app.use('/api/v1', apiRouter);

// Attach error handler middleware
app.use(errorHandler);

export default app;
