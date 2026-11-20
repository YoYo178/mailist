import { gmailController } from '@/dependencies/controllers.js';
import { authMiddleware } from '@/dependencies/middlewares.js';
import { routeWrapper } from '@/lib/api.lib.js';
import { Router } from 'express';

const router: Router = Router();

router.get('/callback', routeWrapper(gmailController.callback));

router.get('/connect', authMiddleware.authenticate, routeWrapper(gmailController.connect));
router.get('/status', authMiddleware.authenticate, routeWrapper(gmailController.getStatus));
router.get('/profile', authMiddleware.authenticate, routeWrapper(gmailController.getProfile));
router.delete('/', authMiddleware.authenticate, routeWrapper(gmailController.disconnect));

export default router;
