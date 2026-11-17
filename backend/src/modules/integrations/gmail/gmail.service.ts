import type { TokenEncryptionService } from '@/infrastructure/security/token-encryption.service.js';
import mongoose from 'mongoose';
import { GmailAccountNotFoundError, GmailReauthorizationRequiredError, GmailTokenRefreshFailedError, InvalidGoogleAccountError, InvalidOrExpiredState } from './gmail.errors.js';
import type { GmailOauthStateService } from './gmail.oauth-state.service.js';
import type { GmailOauthService } from './gmail.oauth.service.js';
import type { GmailRepository } from './gmail.repository.js';

function isInvalidGrantError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const response = 'response' in error ? error.response : undefined;

  if (!response || typeof response !== 'object') return false;

  const data = 'data' in response ? response.data : undefined;

  if (!data || typeof data !== 'object') return false;

  return 'error' in data && data.error === 'invalid_grant';
}

export class GmailService {
  constructor(
    private gmailOAuthService: GmailOauthService,
    private gmailOauthStateService: GmailOauthStateService,
    private gmailRepository: GmailRepository,
    private tokenEncryptionService: TokenEncryptionService,
  ) { }

  async getAuthorizationUrl(userId: string): Promise<string> {
    const state = await this.gmailOauthStateService.create(userId);

    return this.gmailOAuthService.getAuthorizationUrl(state);
  }

  async connectAccount(code: string, state: string) {
    const userId = await this.gmailOauthStateService.consume(state);

    if (!userId) throw InvalidOrExpiredState();

    const tokens = await this.gmailOAuthService.exchangeCode(code);

    if (!tokens.access_token || !tokens.id_token) throw InvalidGoogleAccountError();

    const identity = await this.gmailOAuthService.getAccountIdentity(tokens.id_token);

    await this.gmailRepository.upsert({
      userId: new mongoose.Types.ObjectId(userId),
      provider: 'google',
      providerAccountId: identity.providerAccountId,
      email: identity.email,
      accessToken: this.tokenEncryptionService.encrypt(tokens.access_token),
      ...(tokens.refresh_token && {
        refreshToken: this.tokenEncryptionService.encrypt(tokens.refresh_token),
      }),
      ...(tokens.expiry_date && {
        expiresAt: new Date(tokens.expiry_date),
      }),
      scopes: tokens.scope?.split(' ') ?? [],
    });
  }

  async refreshAccessToken(accountId: string): Promise<string> {
    const account = await this.gmailRepository.findByIdWithTokens(accountId);

    if (!account) throw GmailAccountNotFoundError();

    if (!account.refreshToken) throw GmailReauthorizationRequiredError();

    const refreshToken = this.tokenEncryptionService.decrypt(account.refreshToken);

    const tokens = await this.gmailOAuthService
      .refreshAccessToken(refreshToken)
      .catch((error: unknown) => {
        if (isInvalidGrantError(error)) {
          throw GmailReauthorizationRequiredError();
        }

        throw GmailTokenRefreshFailedError();
      });

    if (!tokens.access_token) throw GmailTokenRefreshFailedError();

    const accessToken = this.tokenEncryptionService.encrypt(tokens.access_token);

    await this.gmailRepository.updateTokens(accountId, {
      accessToken,
      ...(tokens.expiry_date && {
        expiresAt: new Date(tokens.expiry_date),
      }),
    });

    return tokens.access_token;
  }

  async getValidAccessToken(accountId: string): Promise<string> {
    const account = await this.gmailRepository.findByIdWithTokens(accountId);

    if (!account) throw GmailAccountNotFoundError();

    const expiresAt = account.expiresAt?.getTime();

    if (expiresAt && expiresAt > Date.now() + (60 * 1000)) {
      return this.tokenEncryptionService.decrypt(account.accessToken);
    }

    return this.refreshAccessToken(accountId); // TODO: look into the 2nd re-fetch of the same account
  }
}
