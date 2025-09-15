import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin,
  Plus,
  Save,
  X
} from 'lucide-react';
import { useAuth } from '../components/auth/AuthProvider';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  doc, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';

const VolunteerPortal = () => {
  const { user } = useAuth();
  const [volunteerData, setVolunteerData] = useState(null);
  const [assignedFamilies, setAssignedFamilies] = useState([]);
  const [hourLogs, setHourLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHourLogger, setShowHourLogger] = useState(false);

  // Hour logging form state
  const [newHourLog, setNewHourLog] = useState({
    familyId: '',
    hours: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (!user?.profileId) return;

    // Load volunteer data
    const volunteerRef = doc(db, 'volunteers', user.profileId);
    const unsubVolunteer = onSnapshot(volunteerRef, (doc) => {
      if (doc.exists()) {
        setVolunteerData({ id: doc.id, ...doc.data() });
      }
      setLoading(false);
    });

    // Load hour logs
    const hoursQuery = query(
      collection(db, 'volunteer_hours'),
      where('volunteerId', '==', user.profileId),
      orderBy('date', 'desc')
    );
    const unsubHours = onSnapshot(hoursQuery, (snapshot) => {
      const logs = [];
      snapshot.forEach((doc) => {
        logs.push({ id: doc.id, ...doc.data() });
      });
      setHourLogs(logs);
    });

    return () => {
      unsubVolunteer();
      unsubHours();
    };
  }, [user?.profileId]);

  useEffect(() => {
    if (!volunteerData?.familiesAssigned) return;
    setAssignedFamilies(volunteerData.familiesAssigned || []);
  }, [volunteerData]);

  const logHours = async () => {
    if (!newHourLog.familyId || !newHourLog.hours || !newHourLog.description) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await addDoc(collection(db, 'volunteer_hours'), {
        volunteerId: user.profileId,
        volunteerName: volunteerData.volunteerName,
        familyId: newHourLog.familyId,
        familyName: assignedFamilies.find(f => f.registrationId === newHourLog.familyId)?.motherName || '',
        hours: parseFloat(newHourLog.hours),
        description: newHourLog.description,
        date: new Date(newHourLog.date),
        createdAt: serverTimestamp(),
        status: 'submitted'
      });

      setNewHourLog({
        familyId: '',
        hours: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowHourLogger(false);
    } catch (error) {
      console.error('Error logging hours:', error);
      alert('Failed to log hours. Please try again.');
    }
  };

  const totalHours = hourLogs.reduce((sum, log) => sum + (log.hours || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome, {volunteerData?.volunteerName || 'Volunteer'}!
        </h1>
        <p className="text-blue-100 text-lg">
          Thank you for your service to the EMA community
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Families Assigned</p>
              <p className="text-2xl font-bold text-gray-900">{assignedFamilies.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900">{totalHours}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Hours This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {hourLogs
                  .filter(log => {
                    const logDate = new Date(log.date?.toDate?.() || log.date);
                    const now = new Date();
                    return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
                  })
                  .reduce((sum, log) => sum + (log.hours || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Families */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Your Assigned Families</h2>
        </div>
        <div className="p-6">
          {assignedFamilies.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No families assigned yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Contact your EMA coordinator to get assigned to families
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assignedFamilies.map((family) => (
                <div key={family.registrationId} className="border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">{family.motherName}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{family.motherPhone || 'No phone'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{family.motherEmail || 'No email'}</span>
                    </div>
                    {family.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5" />
                        <span>{family.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hour Logging */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Hour Tracking</h2>
            <button
              onClick={() => setShowHourLogger(!showHourLogger)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Log Hours
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Hour Logger Form */}
          {showHourLogger && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Log Your Hours</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Family
                  </label>
                  <select
                    value={newHourLog.familyId}
                    onChange={(e) => setNewHourLog({...newHourLog, familyId: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a family</option>
                    {assignedFamilies.map((family) => (
                      <option key={family.registrationId} value={family.registrationId}>
                        {family.motherName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hours
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={newHourLog.hours}
                    onChange={(e) => setNewHourLog({...newHourLog, hours: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="2.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newHourLog.date}
                    onChange={(e) => setNewHourLog({...newHourLog, date: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newHourLog.description}
                    onChange={(e) => setNewHourLog({...newHourLog, description: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="What did you help with?"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={logHours}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Hours
                </button>
                <button
                  onClick={() => setShowHourLogger(false)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Hour Log History */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Recent Hour Logs</h3>
            {hourLogs.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No hours logged yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Start tracking your volunteer hours above
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {hourLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-4 mb-2">
                          <h4 className="font-medium text-gray-900">{log.familyName}</h4>
                          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {log.hours} hours
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            log.status === 'approved' ? 'bg-green-100 text-green-800' :
                            log.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {log.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{log.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(log.date?.toDate?.() || log.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerPortal;