import { googleOauth2Client } from '@/infrastructure/google/oauth.client.js';
import { TokenEncryptionService } from '@/infrastructure/security/token-encryption.service.js';
import { AuthService } from '@/modules/auth/auth.service.js';
import { EmailService } from '@/modules/emails/email.service.js';
import { GmailOauthStateService } from '@/modules/integrations/gmail/gmail.oauth-state.service.js';
import { GmailOauthService } from '@/modules/integrations/gmail/gmail.oauth.service.js';
import { GmailService } from '@/modules/integrations/gmail/gmail.service.js';
import { UserService } from '@/modules/users/user.service.js';
import { gmailClient } from './clients.js';
import { emailRepository, gmailRepository, userRepository } from './repositories.js';
import { gmailParser } from './parsers.js';
import { emailSyncQueue } from '@/infrastructure/queue/queues/email-sync.queue.js';

export const userService = new UserService(userRepository);

export const authService = new AuthService(userService);

export const tokenEncryptionService = new TokenEncryptionService();

export const emailService = new EmailService(emailRepository);

export const gmailOauthStateService = new GmailOauthStateService();
export const gmailOauthService = new GmailOauthService(googleOauth2Client);
export const gmailService = new GmailService(
  gmailOauthService,
  gmailOauthStateService,
  gmailRepository,
  tokenEncryptionService,
  gmailClient,

  gmailParser,
  emailService,

  emailSyncQueue,
);
