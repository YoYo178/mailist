import type { TokenEncryptionService } from '@/infrastructure/security/token-encryption.service.js';
import type { EmailService } from '@/modules/emails/email.service.js';
import type { Queue } from 'bullmq';
import mongoose from 'mongoose';
import type { GmailClient } from './gmail.client.js';
import {
  GmailAccountNotFoundError,
  GmailReauthorizationRequiredError,
  GmailTokenRefreshFailedError,
  InvalidGoogleAccountError,
  InvalidOrExpiredState,
} from './gmail.errors.js';
import type { GmailOauthStateService } from './gmail.oauth-state.service.js';
import type { GmailOauthService } from './gmail.oauth.service.js';
import type { GmailParser } from './gmail.parser.js';
import type { GmailRepository } from './gmail.repository.js';
import type { GmailSyncJobData, GmailSyncJobResult, IAccountStatus } from './gmail.types.js';

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
    private gmailClient: GmailClient,
    private gmailParser: GmailParser,
    private emailService: EmailService,

    private emailSyncQueue: Queue<GmailSyncJobData, GmailSyncJobResult>,
  ) {}

  async getAuthorizationUrl(userId: string, sessionId: string): Promise<string> {
    const state = await this.gmailOauthStateService.create(userId, sessionId);

    return this.gmailOAuthService.getAuthorizationUrl(state);
  }

  async connectAccount(code: string, state: string, sessionId: string) {
    const oauthState = await this.gmailOauthStateService.consume(state);

    if (!oauthState || oauthState.sessionId !== sessionId) throw InvalidOrExpiredState();

    const tokens = await this.gmailOAuthService.exchangeCode(code);

    if (!tokens.access_token || !tokens.id_token) throw InvalidGoogleAccountError();

    const identity = await this.gmailOAuthService.getAccountIdentity(tokens.id_token);

    await this.gmailRepository.upsert({
      userId: new mongoose.Types.ObjectId(oauthState.userId),
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

    await this.enqueueSync(oauthState.userId);
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

    if (expiresAt && expiresAt > Date.now() + 60 * 1000) {
      return this.tokenEncryptionService.decrypt(account.accessToken);
    }

    return this.refreshAccessToken(accountId); // TODO: look into the 2nd re-fetch of the same account
  }

  async getProfile(userId: string) {
    const account = await this.gmailRepository.findByUserIdWithTokens(userId);

    if (!account) throw GmailAccountNotFoundError();

    const accessToken = await this.getValidAccessToken(account._id.toString());

    return this.gmailClient.getProfile(accessToken);
  }

  async syncMessages(userId: string) {
    const account = await this.gmailRepository.findByUserIdWithTokens(userId);

    if (!account) throw GmailAccountNotFoundError();

    const accountId = account._id.toString();

    const updatedAccount = await this.gmailRepository.updateSyncStatus(accountId, {
      status: 'syncing',
      syncError: null,
    });

    if (!updatedAccount) return;

    try {
      const accessToken = await this.getValidAccessToken(accountId);

      const response = await this.gmailClient.listMessages(accessToken);

      const messageIds = (response.messages ?? [])
        .map((message) => message.id)
        .filter((id): id is string => Boolean(id));

      if (messageIds.length) {
        const messages = await this.gmailClient.getMessages(accessToken, messageIds);

        const parsedMessages = messages.map((message) => ({
          ...this.gmailParser.parse(message),
          userId: account.userId,
          connectedAccountId: account._id,
        }));

        // Don't save if the account was disconnected during synchronization
        if (!(await this.gmailRepository.existsById(accountId))) return;

        await this.emailService.saveMany(parsedMessages);

        // Cleanup if the disconnection happened while the save was in progress
        if (!(await this.gmailRepository.existsById(accountId))) {
          await this.emailService.deleteByConnectedAccountId(accountId);
          return;
        }
      }

      await this.gmailRepository.updateSyncStatus(accountId, {
        status: 'completed',
        lastSyncedAt: new Date(),
        syncError: null,
      });
    } catch (error) {
      try {
        if (await this.gmailRepository.existsById(accountId)) {
          const errorMessage =
            error instanceof Error ? error.message.slice(0, 500) : 'Unknown synchronization error';

          await this.gmailRepository.updateSyncStatus(accountId, {
            status: 'failed',
            syncError: errorMessage,
          });
        }
      } catch (statusError) {
        console.error('[Gmail] Failed to update sync failure status:', statusError);
      }

      // Throw error for BullMQ to handle
      throw error;
    }
  }

  async enqueueSync(userId: string): Promise<void> {
    await this.emailSyncQueue.add('initial-sync', { userId });
  }

  async disconnectAccount(userId: string): Promise<void> {
    try {
      await this.removePendingSyncJobs(userId);
    } catch (error) {
      console.error('[Gmail] Failed to inspect pending sync jobs:', error);
    }

    const account = await this.gmailRepository.findByUserIdWithTokens(userId);

    if (!account) throw GmailAccountNotFoundError();

    const accountId = account._id.toString();

    const encryptedToken = account.refreshToken ?? account.accessToken;

    try {
      const token = this.tokenEncryptionService.decrypt(encryptedToken);
      await this.gmailOAuthService.revokeToken(token);
    } catch (error) {
      console.log('[Gmail] Failed to revoke Google authorization:', error);
    }

    await this.emailService.deleteByConnectedAccountId(accountId);

    await this.gmailRepository.deleteByUserId(userId);
  }

  async removePendingSyncJobs(userId: string): Promise<void> {
    const jobs = await this.emailSyncQueue.getJobs(['waiting', 'delayed', 'prioritized']);

    const userJobs = jobs.filter((job) => job.data.userId === userId);

    const results = await Promise.allSettled(userJobs.map((job) => job.remove()));

    for (const result of results) {
      if (result.status === 'rejected') {
        console.error('[Gmail] Failed to remove a pending sync job');
      }
    }
  }

  async getStatus(userId: string): Promise<IAccountStatus> {
    const account = await this.gmailRepository.findByUserId(userId);

    if (!account) {
      return {
        connected: false,
        email: null,
        syncStatus: null,
        lastSyncedAt: null,
        syncError: null,
      };
    }

    return {
      connected: true,
      email: account.email,
      syncStatus: account.syncStatus,
      lastSyncedAt: account.lastSyncedAt,
      syncError: account.syncError,
    };
  }
}
