export function extractErrorMessage(err: any): string {
  const msg = err?.error?.message;
  if (Array.isArray(msg)) return msg.join(', ');
  if (typeof msg === 'string') return msg;
  return 'Something went wrong';
}
