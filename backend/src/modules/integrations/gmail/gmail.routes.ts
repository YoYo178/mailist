import { gmailController } from '@/dependencies/controllers.js';
import { authMiddleware } from '@/dependencies/middlewares.js';
import { routeWrapper } from '@/lib/api.lib.js';
import { Router } from 'express';

const router: Router = Router();

router.get('/callback', routeWrapper(gmailController.callback));

router.use(authMiddleware.authenticate)

router.get('/connect', routeWrapper(gmailController.connect));
router.get('/status', routeWrapper(gmailController.getStatus));
router.delete('/', routeWrapper(gmailController.disconnect));

export default router;
