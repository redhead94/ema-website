// src/utils/smsIntegration.js
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export function normalizePhone(raw) {
  if (!raw) return '';
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return `+${digits}`;
}

export async function updateSMSConversation(phoneRaw, fields) {
  const phone = normalizePhone(phoneRaw);
  if (!phone) return;
  await setDoc(
    doc(db, 'sms_conversations', phone),    // ✅ same canonical id
    { phoneNumber: phone, ...fields },
    { merge: true }
  );
}
