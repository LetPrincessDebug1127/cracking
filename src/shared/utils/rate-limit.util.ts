export function isRateLimited(
  lastOtpRequest: Date,
  rateLimitMinutes: number,
): boolean {
  const now = new Date();
  return (
    lastOtpRequest &&
    new Date(lastOtpRequest.getTime() + rateLimitMinutes * 60 * 1000) > now
  );
}
