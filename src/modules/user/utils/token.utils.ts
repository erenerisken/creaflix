export function getExpTimestamp(): number {
  const now = new Date();
  const expirationTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);

  return Math.floor(expirationTime.getTime() / 1000);
}
