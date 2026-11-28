import { LLMInfo, type ILLMInfo } from './llm.model.js';
import type { TLLMFailureIncident } from './llm.types.js';

export class LLMRepository {
  async findAll(): Promise<ILLMInfo[]> {
    return LLMInfo.find().exec();
  }

  async findByModelName(modelName: string): Promise<ILLMInfo | null> {
    return LLMInfo.findOne({ modelName }).exec();
  }

  async recordSuccess(modelName: string, responseTimeMs: number): Promise<void> {
    await LLMInfo.findOneAndUpdate(
      { modelName },
      {
        $inc: {
          totalRequests: 1,
          successfulRequests: 1,
          totalResponseTimeMs: responseTimeMs,
        },
        $set: {
          lastSuccessfulAt: new Date(),
        },
      },
      {
        upsert: true,
        runValidators: true,
      },
    ).exec();
  }

  async saveIncident(modelName: string, incidentData: TLLMFailureIncident): Promise<void> {
    await LLMInfo.findOneAndUpdate(
      { modelName },
      {
        $inc: {
          totalRequests: 1,
          ...(incidentData.incidentType === 'generic' && {
            genericFailures: 1,
          }),
          ...(incidentData.incidentType === 'timeout' && {
            timeoutFailures: 1,
          }),
          ...(incidentData.incidentType === 'rate-limit' && {
            rateLimitFailures: 1,
          }),
        },
        $set: {
          lastFailureAt: new Date(),
          ...(incidentData.incidentType === 'rate-limit' && {
            rateLimitedAt: incidentData.rateLimitedAt,
          }),
        },
      },
      {
        upsert: true,
        runValidators: true,
      },
    ).exec();
  }
}
