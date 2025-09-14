// src/utils/sms.js
import { normalizePhone } from './conversation';
import { doc, updateDoc} from 'firebase/firestore';
import { db } from '../config/firebase';

export const sendWelcomeSMSWithType = async (phoneNumber, type, name) => {
  const smsSuccess = await sendWelcomeSMS(phoneNumber, type, name);
  
  if (smsSuccess) {
    try {
      // Update the conversation with contact type
      const normalizedPhone = normalizePhone(phoneNumber);
      await updateDoc(doc(db, 'sms_conversations', normalizedPhone), {
        contactName: name,
        contactType: type
      });
    } catch (error) {
      console.error('Failed to update conversation type:', error);
    }
  }
  
  return smsSuccess;
};

export const sendWelcomeSMS = async (phoneNumber, type, name) => {
  if (!phoneNumber || !type) {
    console.warn('Missing required parameters for welcome SMS');
    return false;
  }

  const messages = {
    volunteer: `Hi ${name || 'there'}, thank you for signing up as a volunteer with EMA! Someone from our team will reach out to you shortly to discuss next steps.`,
    family: `Hi ${name || 'there'}, thank you for registering with EMA! Someone from our team will reach out to you shortly to help coordinate support.`
  };

  try {
    const response = await fetch('/api/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: normalizePhone(phoneNumber),
        message: messages[type],
        sentBy: 'System'
      })
    });
    
    if (!response.ok) {
      throw new Error(`SMS API returned ${response.status}`);
    }
    
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Failed to send welcome SMS:', error);
    return false;
  }
};