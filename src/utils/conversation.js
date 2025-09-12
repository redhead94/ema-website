import { doc, setDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../config/firebase';
import { normalizePhone } from './phone';

// Upsert a conversation keyed by normalized phone
export async function upsertConversation(rawPhone, partial = {}) {
  const phone = normalizePhone(rawPhone);
  const ref = doc(db, 'sms_conversations', phone); // <-- unique per phone
  await setDoc(ref, {
    phoneNumber: phone,
    lastMessageAt: serverTimestamp(),
    unreadCount: 0,
    ...partial,
  }, { merge: true });
  return { id: phone, phoneNumber: phone };
}

export async function bumpUnread(rawPhone, lastMessage) {
  const phone = normalizePhone(rawPhone);
  const ref = doc(db, 'sms_conversations', phone);
  await setDoc(ref, {
    phoneNumber: phone,
    lastMessage,
    lastMessageAt: serverTimestamp(),
    unreadCount: increment(1),
  }, { merge: true });
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