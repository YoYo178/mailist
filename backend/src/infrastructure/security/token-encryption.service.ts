import env from '@/env.js';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export class TokenEncryptionService {
  private readonly algorithm = 'aes-256-gcm';

  private readonly key = Buffer.from(env.GMAIL_TOKEN_ENCRYPTION_KEY, 'base64');

  constructor() {
    if (this.key.length !== 32) {
      throw new Error('Encryption key must exactly be 32 bytes');
    }
  }

  encrypt(value: string) {
    const iv = randomBytes(12);
    const cipher = createCipheriv(this.algorithm, this.key, iv);

    const cipherText = Buffer.concat([cipher.update(value, 'utf-8'), cipher.final()]);

    return [
      iv.toString('base64'),
      cipher.getAuthTag().toString('base64'),
      cipherText.toString('base64'),
    ].join(':');
  }

  decrypt(value: string) {
    const [iv, authTag, cipherText] = value.split(':');

    if (!iv || !authTag || !cipherText) throw new Error('Invalid encrypted token');

    const decipher = createDecipheriv(this.algorithm, this.key, Buffer.from(iv, 'base64'));

    decipher.setAuthTag(Buffer.from(authTag, 'base64'));

    return Buffer.concat([
      decipher.update(Buffer.from(cipherText, 'base64')),
      decipher.final(),
    ]).toString('utf8');
  }
}
