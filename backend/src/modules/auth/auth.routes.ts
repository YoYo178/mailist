import { authController } from '@/dependencies/controllers.js';
import { authMiddleware } from '@/dependencies/middlewares.js';
import { routeWrapper } from '@/lib/api.lib.js';
import { Router } from 'express';

const router: Router = Router();

router.post('/login', routeWrapper(authController.login));
router.post('/register', routeWrapper(authController.register));

router.use(authMiddleware.authenticate);

router.post('/logout', routeWrapper(authController.logout));
router.get('/me', routeWrapper(authController.getMe));

export default router;
