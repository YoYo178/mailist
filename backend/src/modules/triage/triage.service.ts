import { TRIAGE_SYSTEM_PROMPT } from '@prompts/triage.prompts.js';
import type { EmailService } from '../emails/email.service.js';
import type { LLMService } from '../llm/llm.service.js';
import type { TriageRepository } from './triage.repository.js';
import { triageOutputSchema } from './triage.schema.js';

export class TriageService {
  constructor(
    private triageRepository: TriageRepository,
    private emailService: EmailService,

    private llmService: LLMService,
  ) {}

  async processEmail(emailId: string, userId: string): Promise<void> {
    const email = await this.emailService.getByIdAndUserId(emailId, userId);

    if (!email) throw new Error(`Email ${emailId} not found for user ${userId}`);

    await this.triageRepository.create(email.userId, email._id);

    const triage = await this.triageRepository.claimForProcessing(emailId);

    if (!triage) return;

    try {
      const result = await this.llmService.generate({
        systemInstruction: TRIAGE_SYSTEM_PROMPT,
        prompt: JSON.stringify({
          from: email.from,
          to: email.to,
          subject: email.subject,
          date: email.date,
          body: email.textBody || email.snippet,
        }),
        responseSchema: triageOutputSchema,
      });

      const actionItems = result.actionItems.map((item) => ({
        description: item.description,
        deadline: item.deadline ? new Date(item.deadline) : null,
      }));

      await this.triageRepository.updateResult(emailId, {
        ...result,
        actionItems,
      });
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
