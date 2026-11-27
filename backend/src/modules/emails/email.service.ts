import type { IEmail, TInputEmail } from './email.model.js';
import type { EmailRepository } from './email.repository.js';
import type { IEmailListFilters, IEmailListResult, IEmailWithTriage } from './email.types.js';

export class EmailService {
  constructor(private emailRepository: EmailRepository) {}

  async getByUserId(userId: string, page: number = 1, limit: number = 20): Promise<IEmail[]> {
    return this.emailRepository.findByUserId(userId, page, limit);
  }

  async getByThreadId(userId: string, threadId: string): Promise<IEmail[]> {
    return this.emailRepository.findByThreadId(userId, threadId);
  }

  async getByIdAndUserId(emailId: string, userId: string): Promise<IEmail | null> {
    return this.emailRepository.findByIdAndUserId(emailId, userId);
  }

  async saveMany(emails: TInputEmail[]): Promise<IEmail[]> {
    return this.emailRepository.upsertMany(emails);
  }

  async deleteByConnectedAccountId(connectedAccountId: string): Promise<void> {
    await this.emailRepository.deleteByConnectedAccountId(connectedAccountId);
  }

  async getInbox(
    userId: string,
    page: number = 1,
    limit: number = 20,
    filters: IEmailListFilters = {},
  ): Promise<IEmailListResult> {
    return this.emailRepository.findInbox(userId, page, limit, filters);
  }

  async getDetailsByIdAndUserId(emailId: string, userId: string): Promise<IEmailWithTriage | null> {
    return this.emailRepository.findDetailsByIdAndUserId(emailId, userId);
  }
}
