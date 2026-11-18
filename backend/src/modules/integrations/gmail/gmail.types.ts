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
