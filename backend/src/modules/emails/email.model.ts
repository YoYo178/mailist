import type { TMongoFields } from '@/types/mongodb.types.js';
import type { Types } from 'mongoose';
import { model, Schema } from 'mongoose';
import type { IParsedGmailMessage } from '../integrations/gmail/gmail.types.js';

interface IEmail {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  connectedAccountId: Types.ObjectId;

  messageId: string;
  threadId: string;

  labelIds: string[];

  from: string | null;
  to: string[];
  cc: string[];
  bcc: string[];

  subject: string | null;
  date: Date | null;

  textBody: string | null;
  htmlBody: string | null;
  snippet: string | null;

  attachments: IParsedGmailMessage['attachments'];

  createdAt: Date;
  updatedAt: Date;
}

export type TInputEmail = Omit<IEmail, TMongoFields>;

const emailSchema = new Schema<IEmail>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    connectedAccountId: { type: Schema.Types.ObjectId, ref: 'ConnectedAccount', required: true },

    messageId: { type: String, required: true },
    threadId: { type: String, required: true },

    labelIds: { type: [String], default: [] },

    from: { type: String, default: null },
    to: { type: [String], default: [] },
    cc: { type: [String], default: [] },
    bcc: { type: [String], default: [] },

    subject: { type: String, default: null },
    date: { type: Date, default: null },

    textBody: { type: String, default: null },
    htmlBody: { type: String, default: null },
    snippet: { type: String, default: null },

    attachments: {
      type: [
        {
          filename: { type: String, required: true },
          mimeType: { type: String, default: null },
          attachmentId: { type: String, default: null },
          size: { type: Number, default: 0 },
          contentId: { type: String, default: null },
          disposition: { type: String, default: null },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

emailSchema.index({ connectedAccountId: 1, messageId: 1 }, { unique: true });
emailSchema.index({ userId: 1, date: -1 });
emailSchema.index({ userId: 1, threadId: 1 });

const Email = model<IEmail>('Email', emailSchema);

export { Email, type IEmail };
