import crypto from 'crypto';

const QR_SECRET = process.env.QR_SECRET || 'default_qr_signing_secret_key_12345';
const VALIDITY_WINDOW_MS = 60 * 1000; // 60 seconds

export const generateDynamicQRToken = (leaveRequestId: string, studentId: string): string => {
  const timestamp = Date.now().toString();
  const payload = `${leaveRequestId}:${studentId}:${timestamp}`;
  const signature = crypto.createHmac('sha256', QR_SECRET).update(payload).digest('hex');
  
  const rawToken = `${payload}|${signature}`;
  return Buffer.from(rawToken).toString('base64');
};

export const verifyDynamicQRToken = (token: string): { leaveRequestId: string; studentId: string } => {
  try {
    const rawToken = Buffer.from(token, 'base64').toString('ascii');
    const parts = rawToken.split('|');
    if (parts.length !== 2) {
      throw new Error('Invalid token format');
    }

    const [payload, signature] = parts;
    const recalculatedSignature = crypto.createHmac('sha256', QR_SECRET).update(payload).digest('hex');

    if (signature !== recalculatedSignature) {
      throw new Error('Invalid signature');
    }

    const [leaveRequestId, studentId, timestampStr] = payload.split(':');
    const timestamp = parseInt(timestampStr, 10);

    if (Date.now() - timestamp > VALIDITY_WINDOW_MS) {
      throw new Error('Pass expired: dynamic QR codes must be scanned within 60 seconds');
    }

    return { leaveRequestId, studentId };
  } catch (error: any) {
    throw new Error(`Dynamic QR Verification Failed: ${error.message}`);
  }
};
