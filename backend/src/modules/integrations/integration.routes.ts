import { Router } from 'express';
import gmailRouter from './gmail/gmail.routes.js';

const router: Router = Router();

router.use('/gmail', gmailRouter);

export default router;
