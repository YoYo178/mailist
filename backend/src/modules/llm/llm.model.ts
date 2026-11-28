import type { IBaseMongoDocumentWithTimestamp } from '@/types/mongodb.types.js';
import mongoose from 'mongoose';

interface ILLMInfo extends IBaseMongoDocumentWithTimestamp {
  modelName: string;

  totalRequests: number;
  successfulRequests: number;

  genericFailures: number;
  timeoutFailures: number;
  rateLimitFailures: number;

  totalResponseTimeMs: number;

  lastSuccessfulAt: Date | null;
  lastFailureAt: Date | null;
  rateLimitedAt: Date | null;
}

const llmInfoSchema = new mongoose.Schema<ILLMInfo>({
  modelName: { type: String, required: true },

  totalRequests: { type: Number, default: 0 },
  successfulRequests: { type: Number, default: 0 },

  genericFailures: { type: Number, default: 0 },
  timeoutFailures: { type: Number, default: 0 },
  rateLimitFailures: { type: Number, default: 0 },

  totalResponseTimeMs: { type: Number, default: 0 },

  lastSuccessfulAt: { type: Date, default: null },
  lastFailureAt: { type: Date, default: null },
  rateLimitedAt: { type: Date, default: null },
});

llmInfoSchema.index({ modelName: 1 }, { unique: true });

const LLMInfo = mongoose.model('llmIncidents', llmInfoSchema);

export { type ILLMInfo, llmInfoSchema, LLMInfo };
