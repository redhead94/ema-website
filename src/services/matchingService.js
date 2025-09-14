// src/services/matchingService.js
import {
  doc,
  getDoc,
  writeBatch,
  setDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// keep in sync with your other normalizer
export function normalizePhone(raw = '') {
  const d = String(raw).replace(/\D/g, '');
  if (!d) return '';
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith('1')) return `+${d}`;
  return `+${d}`;
}

/**
 * Create a two-way match between a volunteer and a family registration.
 * - Updates volunteer doc: familiesAssigned: array of {registrationId, motherName}
 * - Updates registration doc: assignedVolunteer { volunteerId, volunteerName }
 * - Updates sms_conversations for both phone numbers so Messages shows the link
 */
export async function matchVolunteerToFamily(volunteerId, registrationId) {
  const vRef = doc(db, 'volunteers', volunteerId);
  const rRef = doc(db, 'registrations', registrationId);

  const [vSnap, rSnap] = await Promise.all([getDoc(vRef), getDoc(rRef)]);
  if (!vSnap.exists() || !rSnap.exists()) {
    throw new Error('Volunteer or registration not found.');
  }

  const v = vSnap.data();
  const r = rSnap.data();

  const vName = v.volunteerName || v.name || 'Volunteer';
  const rName = r.motherName || r.name || 'Family';

  const vPhone = normalizePhone(v.volunteerPhone || v.phone || '');
  const rPhone = normalizePhone(r.motherPhone || r.phone || '');

  const batch = writeBatch(db);

  // Update volunteer doc (append family)
  batch.set(
    vRef,
    {
      familiesAssigned: arrayUnion({ registrationId, motherName: rName }),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  // Update registration doc (set volunteer)
  batch.set(
    rRef,
    {
      assignedVolunteer: { volunteerId, volunteerName: vName },
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  // Update conversation: volunteer → list of families
  if (vPhone) {
    batch.set(
      doc(db, 'sms_conversations', vPhone),
      {
        phoneNumber: vPhone,
        contactType: 'volunteer',
        familiesAssigned: arrayUnion({ registrationId, motherName: rName }),
        lastMessageAt: serverTimestamp(), // harmless touch so it bubbles up
      },
      { merge: true }
    );
  }

  // Update conversation: family → single volunteer
  if (rPhone) {
    batch.set(
      doc(db, 'sms_conversations', rPhone),
      {
        phoneNumber: rPhone,
        contactType: 'family',
        volunteerAssigned: { volunteerId, volunteerName: vName },
        lastMessageAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  await batch.commit();
}

/**
 * Remove a match (unassign).
 */
export async function unmatchVolunteerFromFamily(volunteerId, registrationId) {
  const vRef = doc(db, 'volunteers', volunteerId);
  const rRef = doc(db, 'registrations', registrationId);

  const [vSnap, rSnap] = await Promise.all([getDoc(vRef), getDoc(rRef)]);
  if (!vSnap.exists() || !rSnap.exists()) return;

  const v = vSnap.data();
  const r = rSnap.data();

  const vName = v.volunteerName || v.name || 'Volunteer';
  const rName = r.motherName || r.name || 'Family';

  const vPhone = normalizePhone(v.volunteerPhone || v.phone || '');
  const rPhone = normalizePhone(r.motherPhone || r.phone || '');

  const batch = writeBatch(db);

  batch.set(
    vRef,
    {
      familiesAssigned: arrayRemove({ registrationId, motherName: rName }),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  // Clear assigned volunteer if it matches this volunteer
  const current = r.assignedVolunteer?.volunteerId;
  if (current === volunteerId) {
    batch.set(
      rRef,
      { assignedVolunteer: null, updatedAt: serverTimestamp() },
      { merge: true }
    );
  }

  if (vPhone) {
    batch.set(
      doc(db, 'sms_conversations', vPhone),
      { familiesAssigned: arrayRemove({ registrationId, motherName: rName }) },
      { merge: true }
    );
  }

  if (rPhone) {
    // only clear if pointing to this volunteer
    if (current === volunteerId) {
      batch.set(
        doc(db, 'sms_conversations', rPhone),
        { volunteerAssigned: null },
        { merge: true }
      );
    }
  }

  await batch.commit();
}
