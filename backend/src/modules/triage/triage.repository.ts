import { Triage } from './triage.model.js';
import type { ITriage, TTriageStatus } from './triage.types.js';

export class TriageRepository {
  async create(userId: ITriage['userId'], emailId: ITriage['emailId']) {
    return Triage.findOneAndUpdate(
      {
        emailId,
      },
      {
        $setOnInsert: {
          emailId,
          userId,
          status: 'pending',
        },
      },
      {
        upsert: true,
        returnDocument: 'after',
        runValidators: true,
      },
    ).exec();
  }

  async findByEmailId(emailId: string) {
    return Triage.findOne({ emailId }).exec();
  }

  async findByUserId(userId: string) {
    return Triage.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async updateStatus(emailId: string, status: TTriageStatus, error: string | null = null) {
    return Triage.findOneAndUpdate(
      { emailId },
      {
        $set: {
          status,
          error,
        },
      },
      {
        returnDocument: 'after',
        runValidators: true,
      },
    ).exec();
  }

  async updateResult(
    emailId: string,
    data: Pick<ITriage, 'category' | 'priority' | 'summary' | 'actionItems' | 'suggestedReply'>,
  ) {
    return Triage.findOneAndUpdate(
      { emailId },
      {
        $set: {
          ...data,
          status: 'completed',
          processedAt: new Date(),
          error: null,
        },
      },
      {
        returnDocument: 'after',
        runValidators: true,
      },
    ).exec();
  }

  async claimForProcessing(emailId: string) {
    return Triage.findOneAndUpdate(
      { emailId, status: { $in: ['pending', 'failed'] } },
      {
        $set: {
          status: 'processing',
          error: null,
        },
      },
      {
        returnDocument: 'after',
        runValidators: true,
      },
    ).exec();
  }
}
