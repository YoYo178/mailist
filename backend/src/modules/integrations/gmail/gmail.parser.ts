import type { gmail_v1 } from 'googleapis';
import type { IParsedGmailAttachment, IParsedGmailMessage } from './gmail.types.js';

function cleanText(text: string | null | undefined): string | null {
  if (!text) return null;

  const cleaned = text
    // 1. Remove invisible format & joiner characters used in email preview hacks
    // - \u034F: Combining Grapheme Joiner (CGJ)
    // - \u200B-\u200F: Zero-width space, non-joiner, joiner, LTR/RTL marks
    // - \u202A-\u202E, \u2060-\u2069: Directional formatting, Word Joiner, invisible operators
    // - \uFEFF: Zero-width no-break space (BOM)
    // - \u00AD: Soft hyphen
    // - \u180E: Mongolian vowel separator
    // - \u2800: Braille Pattern Blank (commonly used as a visual spacer)
    .replace(/[\u034F\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF\u00AD\u180E\u2800]/g, '')
    // 2. Collapse consecutive whitespace (including &nbsp; \u00A0 and en/em spaces) into a single space
    .replace(/[\s\u00A0\u2000-\u200A\u202F\u205F\u3000]+/g, ' ')
    // 3. Trim leading and trailing spaces LAST
    .trim();

  return cleaned || null;
}

export class GmailParser {
  private decodeBody(data: string | null): string | null {
    if (!data) return null;

    return Buffer.from(data, 'base64url').toString('utf-8');
  }

  private getHeader(headers: gmail_v1.Schema$MessagePartHeader[] | undefined, name: string) {
    return (
      headers?.find?.((header) => header?.name?.toLowerCase?.() === name.toLowerCase())?.value ??
      null
    );
  }

  private extractBodies(
    part: gmail_v1.Schema$MessagePart | undefined,
    result: { textBody: string | null; htmlBody: string | null },
  ): void {
    if (!part) return;

    const mimeType = part.mimeType?.toLowerCase?.();

    if (mimeType === 'text/plain' && part.body?.data)
      result.textBody ??= this.decodeBody(part.body.data);

    if (mimeType === 'text/html' && part.body?.data)
      result.htmlBody ??= this.decodeBody(part.body.data);

    for (const child of part.parts ?? []) {
      this.extractBodies(child, result);
    }
  }

  private extractAttachments(
    part: gmail_v1.Schema$MessagePart | undefined,
    attachments: IParsedGmailAttachment[],
  ): void {
    if (!part) return;

    if (part.filename) {
      const headers = part.headers;
      const getPartHeader = (name: string) => this.getHeader(headers, name);

      attachments.push({
        filename: part.filename,
        mimeType: part.mimeType ?? null,
        attachmentId: part.body?.attachmentId ?? null,
        size: part.body?.size ?? 0,
        contentId: getPartHeader('content-id'),
        disposition: getPartHeader('content-disposition'),
      });
    }

    for (const child of part.parts ?? []) {
      this.extractAttachments(child, attachments);
    }
  }

  parse(message: gmail_v1.Schema$Message): IParsedGmailMessage {
    if (!message.id || !message.threadId)
      throw new Error('Gmail message is missing its identifiers.');

    const headers = message.payload?.headers;
    const getPartHeader = (name: string) => this.getHeader(headers, name);

    const bodies = {
      textBody: null as string | null,
      htmlBody: null as string | null,
    };

    this.extractBodies(message.payload, bodies);

    const attachments: IParsedGmailAttachment[] = [];

    this.extractAttachments(message.payload, attachments);

    const date = message.internalDate ? new Date(Number(message.internalDate)) : null;

    return {
      attachments,
      messageId: message.id,
      threadId: message.threadId,
      labelIds: message.labelIds ?? [],
      from: getPartHeader('from'),
      to:
        getPartHeader('to')
          ?.split(',')
          ?.map((v) => v.trim()) ?? [],
      cc:
        getPartHeader('cc')
          ?.split(',')
          ?.map((v) => v.trim()) ?? [],
      bcc:
        getPartHeader('bcc')
          ?.split(',')
          ?.map((v) => v.trim()) ?? [],
      subject: cleanText(getPartHeader('subject')),
      date,
      textBody: bodies.textBody,
      htmlBody: bodies.htmlBody,
      snippet: cleanText(message.snippet),
    };
  }
}
