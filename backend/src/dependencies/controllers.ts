import { AuthController } from '@/modules/auth/auth.controller.js';
import { EmailController } from '@/modules/emails/email.controller.js';
import { GmailController } from '@/modules/integrations/gmail/gmail.controller.js';
import { authService, emailService, gmailService } from './services.js';

export const authController = new AuthController(authService);
export const gmailController = new GmailController(gmailService);
export const emailController = new EmailController(emailService);
