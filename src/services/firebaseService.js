// src/services/firebaseService.js
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { ensureConversation, normalizePhone } from '../utils/conversation';


/* ----------------------- Save family registration ----------------------- */
export const saveRegistration = async (formData) => {
  try {
    const docRef = await addDoc(collection(db, 'registrations'), {
      ...formData,
      createdAt: serverTimestamp(),
      status: 'pending',
    });

    const phone =
      normalizePhone(formData.motherPhone) ||
      normalizePhone(formData.phone) ||
      normalizePhone(formData.contactPhone) ||
      normalizePhone(formData.primaryPhone);

    if (phone) {
      await ensureConversation(phone, {
        contactName: formData.motherName || formData.name,
        contactType: 'family',
        registrationId: docRef.id,
      });
    }

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error saving registration:', error);
    return { success: false, error: error.message };
  }
};

/* ----------------------- Save volunteer application --------------------- */
export const saveVolunteer = async (formData) => {
  try {
    const docRef = await addDoc(collection(db, 'volunteers'), {
      ...formData,
      createdAt: serverTimestamp(),
      status: 'pending',
      availableDays: formData.availableDays || [],
      availableTimes: formData.availableTimes || [],
    });

    const phone = normalizePhone(formData.volunteerPhone) || normalizePhone(formData.phone);
    if (phone) {
      await ensureConversation(phone, {
        contactName: formData.volunteerName || formData.name,
        contactType: 'volunteer',
        volunteerId: docRef.id,
        email: formData.volunteerEmail || null,
        availableDays: formData.availableDays || [],
        availableTimes: formData.availableTimes || [],
        bestContactMethod: formData.bestContactMethod || null,
        registrationDate: serverTimestamp(),
      });
    }

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error saving volunteer:', error);
    return { success: false, error: error.message };
  }
};

/* ----------------------- Save contact message --------------------------- */
export const saveContact = async (formData) => {
  try {
    const docRef = await addDoc(collection(db, 'contacts'), {
      ...formData,
      createdAt: serverTimestamp(),
      status: 'unread',
    });

    const phone = formData.phone || formData.contactPhone;
    if (phone) {
      await ensureConversation(phone, {
        contactName: formData.name,
        contactType: 'contact',
        contactId: docRef.id,
      });
    }

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error saving contact:', error);
    return { success: false, error: error.message };
  }
};

/* ----------------------- Getters (admin) -------------------------------- */
export const getRegistrations = async () => {
  try {
    const qs = await getDocs(collection(db, 'registrations'));
    const list = [];
    qs.forEach((d) => list.push({ id: d.id, ...d.data() }));
    return { success: true, data: list };
  } catch (error) {
    console.error('Error getting registrations:', error);
    return { success: false, error: error.message };
  }
};

export const getVolunteers = async () => {
  try {
    const qs = await getDocs(collection(db, 'volunteers'));
    const list = [];
    qs.forEach((d) => list.push({ id: d.id, ...d.data() }));
    return { success: true, data: list };
  } catch (error) {
    console.error('Error getting volunteers:', error);
    return { success: false, error: error.message };
  }
};

/* ----------------------- Save donation ---------------------------------- */
export async function saveDonation(donation) {
  try {
    const docData = {
      donorName: donation.donorName || 'Anonymous',
      donorEmail: donation.donorEmail || null,
      donorPhone: donation.donorPhone || null,
      donorMessage: donation.donorMessage || '',
      amountCents: donation.amountCents,
      currency: donation.currency || 'usd',
      amountDisplay: donation.amountDisplay,
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
