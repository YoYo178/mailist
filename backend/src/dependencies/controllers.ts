import { AuthController } from '@/modules/auth/auth.controller.js';
import { authService } from './services.js';

export const authController = new AuthController(authService);
