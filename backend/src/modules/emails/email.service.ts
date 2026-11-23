import type { IEmail, TInputEmail } from './email.model.js';
import type { EmailRepository } from './email.repository.js';

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
    return await this.emailRepository.upsertMany(emails);
  }

  async deleteByConnectedAccountId(connectedAccountId: string): Promise<void> {
    await this.emailRepository.deleteByConnectedAccountId(connectedAccountId);
  }
}
