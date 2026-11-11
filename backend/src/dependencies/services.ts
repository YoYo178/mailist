import { googleOauth2Client } from '@/infrastructure/google/oauth.client.js';
import { AuthService } from '@/modules/auth/auth.service.js';
import { GmailOauthStateService } from '@/modules/integrations/gmail/gmail.oauth-state.service.js';
import { GmailOauthService } from '@/modules/integrations/gmail/gmail.oauth.service.js';
import { GmailService } from '@/modules/integrations/gmail/gmail.service.js';
import { UserService } from '@/modules/users/user.service.js';
import { gmailRepository, userRepository } from './repositories.js';
import { TokenEncryptionService } from '@/infrastructure/security/token-encryption.service.js';

export const userService = new UserService(userRepository);

export const authService = new AuthService(userService);

export const tokenEncryptionService = new TokenEncryptionService();

export const gmailOauthStateService = new GmailOauthStateService();
export const gmailOauthService = new GmailOauthService(googleOauth2Client);
export const gmailService = new GmailService(
  gmailOauthService,
  gmailOauthStateService,
  gmailRepository,
  tokenEncryptionService,
);
