import React, { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Users, Heart, Mail, DollarSign, Calendar, Phone, MapPin, Clock, CheckCircle, XCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('volunteers');
  const [data, setData] = useState({
    volunteers: [],
    registrations: [],
    contacts: [],
    donations: []
  });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVolunteers: 0,
    totalFamilies: 0,
    totalContacts: 0,
    pendingVolunteers: 0
  });

  // Fetch data from Firebase
  const fetchData = async () => {
    setLoading(true);
    try {
      const collections = ['volunteers', 'registrations', 'contacts', 'donations'];
      const results = {};

      for (const collectionName of collections) {
        const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        results[collectionName] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      }

      setData(results);
      
      // Calculate stats
      setStats({
        totalVolunteers: results.volunteers.length,
        totalFamilies: results.registrations.length,
        totalContacts: results.contacts.length,
        totalDonations: results.donations.length,
        pendingVolunteers: results.volunteers.filter(v => v.status === 'pending').length
      });

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update status of a document
  const updateStatus = async (collectionName, docId, newStatus) => {
    try {
      await updateDoc(doc(db, collectionName, docId), {
        status: newStatus
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'No date';
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString();
    }
    return new Date(timestamp).toLocaleDateString();
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      active: 'bg-indigo-100 text-blue-800',
      completed: 'bg-gray-100 text-gray-800',
      unread: 'bg-red-100 text-red-800',
      read: 'bg-indigo-100 text-blue-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status || 'unknown'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center h-auto sm:h-16 py-4 sm:py-0">
            <div className="mb-3 sm:mb-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">EMA Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Manage volunteers and family registrations</p>
            </div>
            <button
              onClick={fetchData}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm w-full sm:w-auto"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Users className="w-6 sm:w-8 h-6 sm:h-8 text-blue-600 mr-2 sm:mr-3" />
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total Volunteers</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalVolunteers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Heart className="w-6 sm:w-8 h-6 sm:h-8 text-red-600 mr-2 sm:mr-3" />
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Families Registered</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalFamilies}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Mail className="w-6 sm:w-8 h-6 sm:h-8 text-green-600 mr-2 sm:mr-3" />
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Contact Messages</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalContacts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <DollarSign className="w-6 sm:w-8 h-6 sm:h-8 text-purple-600 mr-2 sm:mr-3" />
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total Donations</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalDonations}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b border-gray-200">
            <nav className="flex flex-wrap gap-2 sm:gap-0 sm:space-x-8 px-4 sm:px-6">
              {[
                { id: 'volunteers', label: 'Volunteers', icon: Users, count: data.volunteers.length },
                { id: 'registrations', label: 'Family Registrations', icon: Heart, count: data.registrations.length },
                { id: 'contacts', label: 'Contact Messages', icon: Mail, count: data.contacts.length },
                { id: 'donations', label: 'Donations', icon: DollarSign, count: data.donations.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-3 sm:py-4 px-2 sm:px-2 border-b-2 font-medium text-xs sm:text-sm w-full sm:w-auto justify-center sm:justify-start ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  <span className="ml-1 sm:ml-2 bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            {activeTab === 'volunteers' && (
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Volunteer Applications</h3>
                {data.volunteers.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No volunteer applications yet.</p>
                ) : (
                  data.volunteers.map((volunteer) => (
                    <div key={volunteer.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50">
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-3">
                        <div className="mb-2 sm:mb-0">
                          <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{volunteer.volunteerName}</h4>
                          <p className="text-xs sm:text-sm text-gray-600">Applied {formatDate(volunteer.createdAt)}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                          <StatusBadge status={volunteer.status} />
                          <select
                            value={volunteer.status || 'pending'}
                            onChange={(e) => updateStatus('volunteers', volunteer.id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1 w-full sm:w-auto"
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="active">Active</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                        <div className="flex items-center text-gray-600">
                          <Mail className="w-3 sm:w-4 h-3 sm:h-4 mr-2" />
                          <a href={`mailto:${volunteer.volunteerEmail}`} className="hover:text-blue-600 break-all">
                            {volunteer.volunteerEmail}
                          </a>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Phone className="w-3 sm:w-4 h-3 sm:h-4 mr-2" />
                          <a href={`tel:${volunteer.volunteerPhone}`} className="hover:text-blue-600">
                            {volunteer.volunteerPhone}
                          </a>
                        </div>
                        <div className="flex items-center text-gray-600 sm:col-span-2">
                          <Calendar className="w-3 sm:w-4 h-3 sm:h-4 mr-2" />
                          <span className="break-words">
                            {volunteer.availableDays ? volunteer.availableDays.join(', ') : 'No days specified'}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600 sm:col-span-2">
                          <Clock className="w-3 sm:w-4 h-3 sm:h-4 mr-2" />
                          <span className="break-words">
                            {volunteer.availableTimes ? volunteer.availableTimes.join(', ') : 'No times specified'}
                          </span>
                        </div>
                      </div>
                      
                      {volunteer.additionalInfo && (
                        <div className="mt-3 p-2 sm:p-3 bg-gray-50 rounded">
                          <p className="text-xs sm:text-sm text-gray-700">
                            <strong>Additional Info:</strong> {volunteer.additionalInfo}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'registrations' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Family Registrations</h3>
                {data.registrations.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No family registrations yet.</p>
                ) : (
                  data.registrations.map((registration) => (
                    <div key={registration.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{registration.motherName}</h4>
                          <p className="text-sm text-gray-600">Registered {formatDate(registration.createdAt)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <StatusBadge status={registration.status} />
                          <select
                            value={registration.status || 'pending'}
                            onChange={(e) => updateStatus('registrations', registration.id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          <a href={`mailto:${registration.motherEmail}`} className="hover:text-blue-600">
                            {registration.motherEmail || 'No email'}
                          </a>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          <a href={`tel:${registration.motherPhone}`} className="hover:text-blue-600">
                            {registration.motherPhone || 'No phone'}
                          </a>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          {registration.numberOfChildren} children
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          Baby born: {registration.babyBirthday || 'Not specified'}
                        </div>
                      </div>
                      
                      {registration.address && (
                        <div className="mt-3 flex items-start text-gray-600 text-sm">
                          <MapPin className="w-4 h-4 mr-2 mt-0.5" />
                          <span>{registration.address}</span>
                        </div>
                      )}
                      
                      {registration.dietaryRestrictions && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded">
                          <p className="text-sm text-gray-700">
                            <strong>Dietary Restrictions:</strong> {registration.dietaryRestrictions}
                          </p>
                        </div>
                      )}
                      
                      {registration.shulAffiliation && (
                        <div className="mt-2 text-sm text-gray-600">
                          <strong>Shul:</strong> {registration.shulAffiliation}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'contacts' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Messages</h3>
                {data.contacts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No contact messages yet.</p>
                ) : (
                  data.contacts.map((contact) => (
                    <div key={contact.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{contact.name}</h4>
                          <p className="text-sm text-gray-600">Sent {formatDate(contact.createdAt)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <StatusBadge status={contact.status} />
                          <select
                            value={contact.status || 'unread'}
                            onChange={(e) => updateStatus('contacts', contact.id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="unread">Unread</option>
                            <option value="read">Read</option>
                            <option value="responded">Responded</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-gray-600 text-sm mb-3">
                        <Mail className="w-4 h-4 mr-2" />
                        <a href={`mailto:${contact.email}`} className="hover:text-blue-600">
                          {contact.email}
                        </a>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-700">{contact.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'donations' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Donations</h3>
                {data.donations.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No donations yet.</p>
                ) : (
                  data.donations.map((donation) => (
                    <div key={donation.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{donation.donorName}</h4>
                          <p className="text-sm text-gray-600">Donated {formatDate(donation.createdAt)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <StatusBadge status={donation.status} />
                          <span className="text-lg font-bold text-green-600">{donation.amountDisplay}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          <a href={`mailto:${donation.donorEmail}`} className="hover:text-blue-600">
                            {donation.donorEmail}
                          </a>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          <span>{donation.donorPhone || 'No phone'}</span>
                        </div>
                        {donation.transactionId && (
                          <div className="flex items-center text-gray-600">
                            <DollarSign className="w-4 h-4 mr-2" />
                            <span className="font-mono text-xs">ID: {donation.transactionId}</span>
                          </div>
                        )}
                      </div>
                      
                      {donation.donorMessage && (
                        <div className="mt-3 p-3 bg-indigo-50 rounded">
                          <p className="text-sm text-gray-700">
                            <strong>Message:</strong> {donation.donorMessage}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 