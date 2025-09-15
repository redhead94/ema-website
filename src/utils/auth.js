// utils/auth.js
import { normalizePhone } from './conversation';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const storeVerificationCode = async (phone, code) => {
  const normalizedPhone = normalizePhone(phone);
  try {
    await setDoc(doc(db, 'verification_codes', normalizedPhone), {
      code,
      createdAt: new Date(),
      expires: Date.now() + 5 * 60 * 1000, // 5 minutes
      ttl: new Date(Date.now() + 6 * 60 * 1000),
      attempts: 0
    });
    return true;
  } catch (error) {
    console.error('Error storing verification code:', error);
    return false;
  }
};

export const verifyCode = async (phone, code) => {
  const normalizedPhone = normalizePhone(phone);
  try {
    const codeDoc = await getDoc(doc(db, 'verification_codes', normalizedPhone));
    
    if (!codeDoc.exists()) {
      console.log('No verification code found for phone:', normalizedPhone);
      return false;
    }

    const stored = codeDoc.data();
    
    if (Date.now() > stored.expires) {
      console.log('Verification code expired');
      await deleteDoc(doc(db, 'verification_codes', normalizedPhone));
      return false;
    }
    
    if (stored.code !== code) {
      console.log('Code mismatch:', { stored: stored.code, provided: code });
      return false;
    }
    
    // Clean up used code
    await deleteDoc(doc(db, 'verification_codes', normalizedPhone));
    return true;
  } catch (error) {
    console.error('Error verifying code:', error);
    return false;
  }
};

// Client-side token helpers (no JWT dependency)
export const generateSimpleToken = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const isTokenExpired = (tokenData) => {
  if (!tokenData || !tokenData.expires) return true;
  return Date.now() > tokenData.expires;
};