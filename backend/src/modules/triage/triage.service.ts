import type { EmailService } from '../emails/email.service.js';
import type { TriageRepository } from './triage.repository.js';

export class TriageService {
  constructor(
    private triageRepository: TriageRepository,
    private emailService: EmailService,
  ) {}

  async processEmail(emailId: string, userId: string): Promise<void> {
    const email = await this.emailService.getByIdAndUserId(emailId, userId);

    if (!email) throw new Error(`Email ${emailId} not found for user ${userId}`);

    await this.triageRepository.create(email.userId, email._id);

    const triage = await this.triageRepository.claimForProcessing(emailId);

    if (!triage) return;

    try {
      // TODO: LLM part
    } catch (error) {
      await this.triageRepository.updateStatus(
        emailId,
        'failed',
        error instanceof Error
          ? error.message
          : 'An error occured while performing triage for email',
      );

      throw error;
    }
  }
}
