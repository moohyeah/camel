import { IncomingMessage } from 'http';

export function getBaseUrl(req?: IncomingMessage) {
  if (!req) return '';
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${protocol}://${host}`;
}