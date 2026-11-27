import { integrationController } from '@/dependencies/controllers.js';
import { routeWrapper } from '@/lib/api.lib.js';
import { Router } from 'express';
import gmailRouter from './gmail/gmail.routes.js';

const router: Router = Router();

router.use('/', routeWrapper(integrationController.listIntegrations));
router.use('/gmail', gmailRouter);

export default router;
