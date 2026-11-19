import { type gmail_v1, google } from 'googleapis';

export class GmailClient {
  private getClient(accessToken: string) {
    const auth = new google.auth.OAuth2();

    auth.setCredentials({
      access_token: accessToken,
    });

    const gmail = google.gmail({
      version: 'v1',
      auth,
    });

    return gmail;
  }

  async getProfile(accessToken: string): Promise<gmail_v1.Schema$Profile> {
    const gmail = this.getClient(accessToken);

    const { data } = await gmail.users.getProfile({
      userId: 'me',
    });

    return data;
  }

  async listMessages(
    accessToken: string,
    options?: {
      maxResults?: number;
      pageToken?: string;
      query?: string;
    },
  ): Promise<gmail_v1.Schema$ListMessagesResponse> {
    const gmail = this.getClient(accessToken);

    const { data } = await gmail.users.messages.list({
      userId: 'me',
      maxResults: options?.maxResults ?? 50,
      pageToken: options?.pageToken ?? '',
      q: options?.query ?? '',
    });

    return data;
  }

  async getMessages(accessToken: string, messageIds: string[]): Promise<gmail_v1.Schema$Message[]> {
    const gmail = this.getClient(accessToken);
    return Promise.all(
      messageIds.map(async (id) => {
        const { data } = await gmail.users.messages.get({
          userId: 'me',
          id,
          format: 'full',
        });

        return data;
      }),
    );
  }
}
