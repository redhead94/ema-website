// src/utils/conversations.js
import { doc, setDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../config/firebase';

export function normalizePhone(raw = '') {
  const d = String(raw).replace(/\D/g, '');
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith('1')) return `+${d}`;
  return d ? `+${d}` : '';
}

// One doc per phone (doc id = normalized phone)
export async function ensureConversation(phoneRaw, fields = {}) {
  const phone = normalizePhone(phoneRaw);
  if (!phone) return;
  await setDoc(
    doc(db, 'sms_conversations', phone),
    { phoneNumber: phone, lastMessageAt: serverTimestamp(), unreadCount: 0, ...fields },
    { merge: true }
  );
}

export async function bumpUnread(phoneRaw, lastMessage) {
  const phone = normalizePhone(phoneRaw);
  if (!phone) return;
  await setDoc(
    doc(db, 'sms_conversations', phone),
    {
      phoneNumber: phone,
      lastMessage,
      lastMessageDirection: 'inbound',
      lastMessageAt: serverTimestamp(),
      unreadCount: increment(1),
    },
    { merge: true }
  );
}

export async function markRead(phoneRaw) {
  const phone = normalizePhone(phoneRaw);
  if (!phone) return;
  await setDoc(
    doc(db, 'sms_conversations', phone),
    { phoneNumber: phone, unreadCount: 0 },
    { merge: true }
  );
}
