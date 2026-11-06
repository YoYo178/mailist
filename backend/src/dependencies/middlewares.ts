import { AuthMiddleware } from '@/middlewares/auth.middleware.js';
import { userService } from './services.js';

export const authMiddleware = new AuthMiddleware(userService);
