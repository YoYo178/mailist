import type { IConnectedAccount } from './gmail.model.js';

export interface IOauthState {
  userId: string;
  sessionId: string;
}

export interface IParsedGmailAttachment {
  filename: string;
  mimeType: string | null;
  attachmentId: string | null;
  size: number;
  contentId: string | null;
  disposition: string | null;
}

export interface IParsedGmailMessage {
  attachments: IParsedGmailAttachment[];
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
}

export interface GmailSyncJobData {
  userId: string;
}

export interface GmailSyncJobResult {
  success: boolean;
  userId: string;
}

export interface IAccountStatus {
  connected: boolean;
  email: IConnectedAccount['email'] | null;
  syncStatus: IConnectedAccount['syncStatus'] | null;
  lastSyncedAt: IConnectedAccount['lastSyncedAt'];
  syncError: IConnectedAccount['syncError'];
}
