// src/services/firebaseService.js
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

// Save family registration to Firestore
export const saveRegistration = async (formData) => {
  try {
    const docRef = await addDoc(collection(db, 'registrations'), {
      ...formData,
      createdAt: serverTimestamp(),
      status: 'pending' // You can track status: pending, active, completed
    });
    
    console.log('Registration saved with ID:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error saving registration:', error);
    return { success: false, error: error.message };
  }
};

// Save volunteer application to Firestore
export const saveVolunteer = async (formData) => {
  try {
    const docRef = await addDoc(collection(db, 'volunteers'), {
      ...formData,
      createdAt: serverTimestamp(),
      status: 'pending', // pending, approved, active
      availableDays: formData.availableDays || [],
      availableTimes: formData.availableTimes || []
    });
    
    console.log('Volunteer saved with ID:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error saving volunteer:', error);
    return { success: false, error: error.message };
  }
};

// Save contact form message to Firestore
export const saveContact = async (formData) => {
  try {
    const docRef = await addDoc(collection(db, 'contacts'), {
      ...formData,
      createdAt: serverTimestamp(),
      status: 'unread' // unread, read, responded
    });
    
    console.log('Contact saved with ID:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error saving contact:', error);
    return { success: false, error: error.message };
  }
};


// Get all registrations (for admin use later)
export const getRegistrations = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'registrations'));
    const registrations = [];
    querySnapshot.forEach((doc) => {
      registrations.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: registrations };
  } catch (error) {
    console.error('Error getting registrations:', error);
    return { success: false, error: error.message };
  }
};

// Get all volunteers (for admin use later)
export const getVolunteers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'volunteers'));
    const volunteers = [];
    querySnapshot.forEach((doc) => {
      volunteers.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: volunteers };
  } catch (error) {
    console.error('Error getting volunteers:', error);
    return { success: false, error: error.message };
  }
};


export async function saveDonation(donation) {
  try {
    // Shape example; tweak collection name/fields as you prefer
    const doc = {
      donorName: donation.donorName || 'Anonymous',
      donorEmail: donation.donorEmail || null,
      donorPhone: donation.donorPhone || null,
      donorMessage: donation.donorMessage || '',
      amountCents: donation.amountCents,
      currency: donation.currency || 'usd',
      amountDisplay: donation.amountDisplay,      // "$25.00"
      sessionId: donation.sessionId,
      paymentIntentId: donation.paymentIntentId,
      chargeId: donation.chargeId,
      receiptUrl: donation.receiptUrl || null,
      createdAt: new Date().toISOString(),
      status: donation.status || 'paid',
    };
    // e.g., 'donations' collection
    const ref = await addDoc(collection(db, 'donations'), doc);
    return { success: true, id: ref.id };
  } catch (error) {
    console.error('saveDonation error:', error);
    return { success: false, error: error.message };
  }
}