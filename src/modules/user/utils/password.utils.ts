import { createHash } from 'crypto';

export function getPasswordHash(password: string, salt: string): string {
  return createHash('sha256')
    .update(password + salt)
    .digest('hex');
}
