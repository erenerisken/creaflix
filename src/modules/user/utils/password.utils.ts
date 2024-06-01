import { createHash, randomBytes } from 'crypto';

export function generateSalt(): string {
  return randomBytes(128).toString('base64');
}

export function getPasswordHash(password: string, salt: string): string {
  return createHash('sha256')
    .update(password + salt)
    .digest('hex');
}
