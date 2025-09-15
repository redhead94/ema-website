// utils/auth.js
import { normalizePhone } from './conversation';

// Generate 6-digit verification code
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store verification code temporarily (you might want to use Redis in production)
const verificationCodes = new Map();

export const storeVerificationCode = (phone, code) => {
  const normalizedPhone = normalizePhone(phone);
  verificationCodes.set(normalizedPhone, {
    code,
    expires: Date.now() + 5 * 60 * 1000 // 5 minutes
  });
};

export const verifyCode = (phone, code) => {
  const normalizedPhone = normalizePhone(phone);
  const stored = verificationCodes.get(normalizedPhone);
  
  if (!stored) return false;
  if (Date.now() > stored.expires) {
    verificationCodes.delete(normalizedPhone);
    return false;
  }
  if (stored.code !== code) return false;
  
  verificationCodes.delete(normalizedPhone);
  return true;
};

// Client-side token helpers (no JWT dependency)
export const generateSimpleToken = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const isTokenExpired = (tokenData) => {
  if (!tokenData || !tokenData.expires) return true;
  return Date.now() > tokenData.expires;
};