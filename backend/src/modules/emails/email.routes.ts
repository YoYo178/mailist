import { emailController } from '@/dependencies/controllers.js';
import { authMiddleware } from '@/dependencies/middlewares.js';
import { routeWrapper } from '@/lib/api.lib.js';
import { Router } from 'express';

const emailRouter: Router = Router();

emailRouter.get('/', authMiddleware.authenticate, routeWrapper(emailController.getInbox));
emailRouter.get('/:emailId', authMiddleware.authenticate, routeWrapper(emailController.getById))

export default emailRouter;
