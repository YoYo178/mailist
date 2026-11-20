import { authController } from '@/dependencies/controllers.js';
import { authMiddleware } from '@/dependencies/middlewares.js';
import { routeWrapper } from '@/lib/api.lib.js';
import { Router } from 'express';

const router: Router = Router();

router.post('/register', routeWrapper(authController.register));
router.post('/login', routeWrapper(authController.login));

router.post('/logout', authMiddleware.authenticate, routeWrapper(authController.logout));
router.get('/me', authMiddleware.authenticate, routeWrapper(authController.getMe));

export default router;
