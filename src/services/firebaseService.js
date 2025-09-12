// src/services/firebaseService.js
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  doc,
  setDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { updateSMSConversation } from '../utils/smsIntegration'

/* ------------------------------------------------------------------ */
/* Helpers: phone normalization + sms_conversations upsert             */
/* ------------------------------------------------------------------ */

function normalizePhone(raw) {
  if (!raw) return '';
  const digits = String(raw).replace(/\D/g, '');
  // Basic US E.164: add leading 1 if 10 digits; keep leading 1 if 11; else prefix +
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return `+${digits}`; // fallback for other lengths
}

async function upsertSmsConversation({
  phoneRaw,
  contactName,
  contactType, // 'volunteer' | 'family' | 'contact'
  linkFields = {}, // e.g., { volunteerId, registrationId }
  lastMessage,
}) {
  const phone = normalizePhone(phoneRaw);
  if (!phone) return;

  const ref = doc(db, 'sms_conversations', phone); // one doc per phone
  const payload = {
    phoneNumber: phone,
    contactName: contactName || 'Unknown Contact',
    contactType: contactType || 'contact',
    lastMessage: lastMessage || null,
    lastMessageDirection: lastMessage ? 'outbound' : null,
    lastMessageAt: serverTimestamp(),
    unreadCount: 0,
    ...linkFields,
  };

  await setDoc(ref, payload, { merge: true });
  return phone;
}

/* ------------------------------------------------------------------ */
/* Save family registration to Firestore                               */
/* ------------------------------------------------------------------ */
export const saveRegistration = async (formData) => {
  try {
    const docRef = await addDoc(collection(db, 'registrations'), {
      ...formData,
      createdAt: serverTimestamp(),
      status: 'pending', // pending, active, completed
    });

    // OPTIONAL: if you want families to appear in SMS right away
    const phone =
      formData.motherPhone ||
      formData.phone ||
      formData.contactPhone ||
      formData.primaryPhone;
    
    if (phone) {
      await upsertSmsConversation({
        phoneRaw: phone,
        contactName: formData.motherName || formData.name,
        contactType: 'family',
        linkFields: { registrationId: docRef.id },
      });
    }

    console.log('Registration saved with ID:', docRef.id);

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error saving registration:', error);
    return { success: false, error: error.message };
  }
};

/* ------------------------------------------------------------------ */
/* Save volunteer application to Firestore                             */
/* ------------------------------------------------------------------ */
export const saveVolunteer = async (formData) => {
  try {
    const docRef = await addDoc(collection(db, 'volunteers'), {
      ...formData,
      createdAt: serverTimestamp(),
      status: 'pending', // pending, approved, active
      availableDays: formData.availableDays || [],
      availableTimes: formData.availableTimes || [],
    });

    // ✅ Ensure a single conversation per phone for SMS dashboard
    const phone = formData.volunteerPhone || formData.phone;
    if (phone) {
      await upsertSmsConversation({
        phoneRaw: phone,
        contactName: formData.volunteerName || formData.name,
        contactType: 'volunteer',
        linkFields: { volunteerId: docRef.id },
      });
    }

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error saving volunteer:', error);
    return { success: false, error: error.message };
  }
};

/* ------------------------------------------------------------------ */
/* Save contact form message to Firestore                              */
/* ------------------------------------------------------------------ */
export const saveContact = async (formData) => {
  try {
    const docRef = await addDoc(collection(db, 'contacts'), {
      ...formData,
      createdAt: serverTimestamp(),
      status: 'unread', // unread, read, responded
    });

    // OPTIONAL: create/merge an SMS conversation if a phone was provided
    const phone = formData.phone || formData.contactPhone;
    if (phone) {
      await upsertSmsConversation({
        phoneRaw: phone,
        contactName: formData.name,
        contactType: 'contact',
        linkFields: { contactId: docRef.id },
      });
    }

    console.log('Contact saved with ID:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error saving contact:', error);
    return { success: false, error: error.message };
  }
};

/* ------------------------------------------------------------------ */
/* Get all registrations (for admin)                                   */
/* ------------------------------------------------------------------ */
export const getRegistrations = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'registrations'));
    const registrations = [];
    querySnapshot.forEach((d) => {
      registrations.push({ id: d.id, ...d.data() });
    });
    return { success: true, data: registrations };
  } catch (error) {
    console.error('Error getting registrations:', error);
    return { success: false, error: error.message };
  }
};

/* ------------------------------------------------------------------ */
/* Get all volunteers (for admin)                                      */
/* ------------------------------------------------------------------ */
export const getVolunteers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'volunteers'));
    const volunteers = [];
    querySnapshot.forEach((d) => {
      volunteers.push({ id: d.id, ...d.data() });
    });
    return { success: true, data: volunteers };
  } catch (error) {
    console.error('Error getting volunteers:', error);
    return { success: false, error: error.message };
  }
};

/* ------------------------------------------------------------------ */
/* Save donation                                                       */
/* ------------------------------------------------------------------ */
export async function saveDonation(donation) {
  try {
    const docData = {
      donorName: donation.donorName || 'Anonymous',
      donorEmail: donation.donorEmail || null,
      donorPhone: donation.donorPhone || null,
      donorMessage: donation.donorMessage || '',
      amountCents: donation.amountCents,
      currency: donation.currency || 'usd',
      amountDisplay: donation.amountDisplay, // "$25.00"
      sessionId: donation.sessionId,
      paymentIntentId: donation.paymentIntentId,
      chargeId: donation.chargeId,
      receiptUrl: donation.receiptUrl || null,
      createdAt: serverTimestamp(),
      status: donation.status || 'paid',
    };
    const ref = await addDoc(collection(db, 'donations'), docData);
    return { success: true, id: ref.id };
  } catch (error) {
    console.error('saveDonation error:', error);
    return { success: false, error: error.message };
  }
}
