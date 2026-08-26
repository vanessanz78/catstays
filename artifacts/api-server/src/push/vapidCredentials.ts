import { createECDH } from 'node:crypto';

function base64Url(value: Buffer): string {
  return value.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodeBase64Url(value: string): Buffer {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='), 'base64');
}

export function getVapidCredentials(): { publicKey: string; privateKey: string } | null {
  const privateKey = String(process.env.VAPID_PRIVATE_KEY || '').trim();
  if (!privateKey) return null;

  try {
    const ecdh = createECDH('prime256v1');
    ecdh.setPrivateKey(decodeBase64Url(privateKey));
    return { privateKey, publicKey: base64Url(ecdh.getPublicKey()) };
  } catch (error) {
    console.warn('[push] VAPID_PRIVATE_KEY is invalid:', error instanceof Error ? error.message : error);
    return null;
  }
}
