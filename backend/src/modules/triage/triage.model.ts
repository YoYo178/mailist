import { model, Schema } from 'mongoose';
import {
  TRIAGE_CATEGORIES,
  TRIAGE_PRIORITIES,
  TRIAGE_STATUSES,
  type ITriage,
  type ITriageActionItem,
} from './triage.types.js';

const actionItemSchema = new Schema<ITriageActionItem>(
  {
    description: { type: String, required: true },
    deadline: { type: Date, default: null },
  },
  { _id: false },
);

const triageSchema = new Schema<ITriage>(
  {
    emailId: {
      type: Schema.Types.ObjectId,
      ref: 'Email',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: TRIAGE_STATUSES,
      default: 'pending',
    },
    category: {
      type: String,
      enum: [...TRIAGE_CATEGORIES, null],
      default: null,
    },
    priority: {
      type: String,
      enum: [...TRIAGE_PRIORITIES, null],
      default: null,
    },
    summary: { type: String, default: null },
    actionItems: { type: [actionItemSchema], default: [] },
    suggestedReply: { type: String, default: null },
    processedAt: { type: Date, default: null },
    error: { type: String, default: null },
  },
  { timestamps: true },
);

triageSchema.index({ emailId: 1 }, { unique: true });
triageSchema.index({ userId: 1, status: 1 });
triageSchema.index({ userId: 1, priority: 1 });

const Triage = model<ITriage>('Triage', triageSchema);

export { Triage };
