import type { TMongoFields } from '@/types/mongodb.types.js';
import mongoose, { Types } from 'mongoose';

const PROVIDERS = ['google'] as const;
type TProvider = (typeof PROVIDERS)[number];

const SYNC_STATES = ['pending', 'syncing', 'completed', 'failed'] as const;
type TGmailSyncStatus = (typeof SYNC_STATES)[number];

interface IConnectedAccount {
  _id: Types.ObjectId;

  userId: Types.ObjectId;

  provider: (typeof PROVIDERS)[number];
  providerAccountId: string;

  email: string;

  accessToken: string;
  refreshToken?: string;

  expiresAt?: Date;

  scopes: string[];

  syncStatus: TGmailSyncStatus;
  lastSyncedAt: Date | null;
  syncError: string | null;

  createdAt: Date;
  updatedAt: Date;
}

export type TInputConnectedAccount = Omit<
  IConnectedAccount,
  TMongoFields | 'syncStatus' | 'lastSyncedAt' | 'syncError'
>;

const connectedAccountSchema = new mongoose.Schema<IConnectedAccount>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    provider: { type: String, enum: PROVIDERS, required: true },
    providerAccountId: { type: String, required: true },

    email: { type: String, required: true },

    accessToken: { type: String, required: true, select: false },
    refreshToken: { type: String, select: false },

    expiresAt: { type: Date },

    scopes: { type: [String], default: [] },

    lastSyncedAt: { type: Date, default: null },
    syncError: { type: String, default: null },
    syncStatus: { type: String, enum: SYNC_STATES, default: 'pending' },
  },
  { timestamps: true },
);

connectedAccountSchema.index({ userId: 1, provider: 1 }, { unique: true });

const ConnectedAccount = mongoose.model<IConnectedAccount>(
  'ConnectedAccount',
  connectedAccountSchema,
);

export {
  ConnectedAccount,
  PROVIDERS,
  SYNC_STATES,
  type IConnectedAccount,
  type TGmailSyncStatus,
  type TProvider,
};
