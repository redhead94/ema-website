import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  collection,
  getDocs,
  orderBy,
  query,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { matchVolunteerToFamily, unmatchVolunteerFromFamily } from '../services/matchingService';

export function useAdminData() {
  const [loading, setLoading] = useState(true);
  const [volunteers, setVolunteers] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [donations, setDonations] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const load = async (name) => {
        const q = query(collection(db, name), orderBy('createdAt', 'desc'));
        const qs = await getDocs(q);
        return qs.docs.map(d => ({ id: d.id, ...d.data() }));
      };
      const [v, r, c, d] = await Promise.all([
        load('volunteers'),
        load('registrations'),
        load('contacts'),
        load('donations'),
      ]);
      setVolunteers(v);
      setRegistrations(r);
      setContacts(c);
      setDonations(d);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateStatus = useCallback(async (collectionName, id, status) => {
    await updateDoc(doc(db, collectionName, id), { status });
    fetchData();
  }, [fetchData]);

  const deleteRegistration = useCallback(async (reg) => {
    const ok = window.confirm(`Delete registration for ${reg.motherName || 'this family'}? This cannot be undone.`);
    if (!ok) return;
    if (reg.assignedVolunteer?.volunteerId) {
      await unmatchVolunteerFromFamily(reg.assignedVolunteer.volunteerId, reg.id);
    }
    await deleteDoc(doc(db, 'registrations', reg.id));
    fetchData();
  }, [fetchData]);

  const handleMatch   = useCallback(async (volunteerId, registrationId) => {
    await matchVolunteerToFamily(volunteerId, registrationId);
    fetchData();
  }, [fetchData]);

  const handleUnmatch = useCallback(async (volunteerId, registrationId) => {
    await unmatchVolunteerFromFamily(volunteerId, registrationId);
    fetchData();
  }, [fetchData]);

  const stats = useMemo(() => ({
    totalVolunteers: volunteers.length,
    totalFamilies: registrations.length,
    totalContacts: contacts.length,
    totalDonations: donations
      .reduce((sum, d) => sum + (d.amountCents || 0) / 100, 0)
      .toFixed(2),
    pendingVolunteers: volunteers.filter(v => v.status === 'pending').length,
  }), [volunteers, registrations, contacts, donations]);

  return {
    loading,
    data: { volunteers, registrations, contacts, donations },
    stats,
    actions: {
      fetchData,
      updateStatus,
      deleteRegistration,
      handleMatch,
      handleUnmatch,
    }
  };
}

export function formatDate(ts) {
  if (!ts) return 'No date';
  if (ts?.toDate) return ts.toDate().toLocaleDateString();
  return new Date(ts).toLocaleDateString();
}
