import type { TApiResponse } from '@/lib/api.lib.js';
import { UnauthorizedUserError } from '@/modules/auth/auth.errors.js';
import type { Request } from 'express';
import { GoogleAuthDeniedError } from './gmail.errors.js';
import { callbackSuccessSchema } from './gmail.schema.js';
import type { GmailService } from './gmail.service.js';

export class GmailController {
  constructor(private gmailService: GmailService) {
    this.bindMethods();
  }

  private bindMethods() {
    this.connect = this.connect.bind(this);
    this.callback = this.callback.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.getStatus = this.getStatus.bind(this);
  }

  async connect(req: Request): Promise<TApiResponse> {
    if (!req.user?._id) throw UnauthorizedUserError();

    const targetUrl = await this.gmailService.getAuthorizationUrl(req.user._id.toString());

    return {
      statusCode: 302,
      targetUrl,
    };
  }

  async callback(req: Request): Promise<TApiResponse> {
    const { code, state, error } = callbackSuccessSchema.parse(req.query);

    if (error) throw GoogleAuthDeniedError();

    await this.gmailService.connectAccount(code, state);

    return {
      data: null,
      message: 'Google account connected successfully',
      statusCode: 200,
      success: true,
    };
  }

  async disconnect(): Promise<TApiResponse> {}

  async getStatus(): Promise<TApiResponse> {}
}
