import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export const updateSMSConversation = async (phoneNumber, contactInfo) => {
  if (!db || !phoneNumber) return;
  
  const conversationRef = doc(db, 'sms_conversations', phoneNumber);
  
  // Update or create conversation with contact info
  await setDoc(conversationRef, {
    phoneNumber,
    lastMessage: null,
    lastMessageAt: null,
    unreadCount: 0,
    status: 'registered', // New status for pre-registered contacts
    assignedTo: null,
    ...contactInfo
  }, { merge: true }); // merge: true preserves existing conversation data if it exists
};