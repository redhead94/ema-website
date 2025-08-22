import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export const saveRegistration = async (formData) => {
  try {
    const docRef = await addDoc(collection(db, 'registrations'), {
      ...formData,
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error saving registration:', error);
    return { success: false, error };
  }
};

export const saveVolunteer = async (formData) => {
  try {
    const docRef = await addDoc(collection(db, 'volunteers'), {
      ...formData,
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error saving volunteer:', error);
    return { success: false, error };
  }
};

export const saveDonation = async (formData) => {
  try {
    const docRef = await addDoc(collection(db, 'donations'), {
      ...formData,
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error saving donation:', error);
    return { success: false, error };
  }
};

export const saveContact = async (formData) => {
  try {
    const docRef = await addDoc(collection(db, 'contacts'), {
      ...formData,
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error saving contact:', error);
    return { success: false, error };
  }
};