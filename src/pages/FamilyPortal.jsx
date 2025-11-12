import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Phone, 
  Mail, 
  Users, 
  Baby, 
  Home,
  Clock,
  AlertCircle,
  CheckCircle,
  Edit,
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
  updateDoc, 
  doc, 
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

const FamilyPortal = () => {
  const { user } = useAuth();
  const [familyData, setFamilyData] = useState(null);
  const [assignedVolunteer, setAssignedVolunteer] = useState(null);
  const [supportRequests, setSupportRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);

  // Support request form state
  const [newRequest, setNewRequest] = useState({
    type: '',
    description: '',
    urgency: 'normal',
    preferredDate: ''
  });

  // Profile edit state
  const [profileEdits, setProfileEdits] = useState({});

  useEffect(() => {
    if (!user?.profileId) return;

    // Load family data
    const familyRef = doc(db, 'registrations', user.profileId);
    const unsubFamily = onSnapshot(familyRef, (doc) => {
      if (doc.exists()) {
        const data = { id: doc.id, ...doc.data() };
        setFamilyData(data);
        setProfileEdits(data);
        
        // Set assigned volunteer if exists
        if (data.assignedVolunteer) {
          setAssignedVolunteer(data.assignedVolunteer);
        }
      }
      setLoading(false);
    });

    // Load support requests
    const requestsQuery = query(
      collection(db, 'support_requests'),
      where('familyId', '==', user.profileId)
    );
    const unsubRequests = onSnapshot(requestsQuery, (snapshot) => {
      const requests = [];
      snapshot.forEach((doc) => {
        requests.push({ id: doc.id, ...doc.data() });
      });
      setSupportRequests(requests.sort((a, b) => (b.createdAt?.toDate?.() || b.createdAt) - (a.createdAt?.toDate?.() || a.createdAt)));
    });

    return () => {
      unsubFamily();
      unsubRequests();
    };
  }, [user?.profileId]);

  const submitSupportRequest = async () => {
    if (!newRequest.type || !newRequest.description) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await addDoc(collection(db, 'support_requests'), {
        familyId: user.profileId,
        familyName: familyData.motherName,
        type: newRequest.type,
        description: newRequest.description,
        urgency: newRequest.urgency,
        preferredDate: newRequest.preferredDate ? new Date(newRequest.preferredDate) : null,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      setNewRequest({
        type: '',
        description: '',
        urgency: 'normal',
        preferredDate: ''
      });
      setShowRequestForm(false);
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Failed to submit request. Please try again.');
    }
  };

  const updateProfile = async () => {
    try {
      await updateDoc(doc(db, 'registrations', user.profileId), {
        motherEmail: profileEdits.motherEmail,
        motherPhone: profileEdits.motherPhone,
        address: profileEdits.address,
        numberOfChildren: profileEdits.numberOfChildren,
        updatedAt: serverTimestamp()
      });
      setEditingProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const supportTypes = [
    { value: 'groceries', label: 'Grocery Shopping' },
    { value: 'childcare', label: 'Childcare' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'meals', label: 'Meal Preparation' },
    { value: 'cleaning', label: 'House Cleaning' },
    { value: 'errands', label: 'Errands' },
    { value: 'other', label: 'Other' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-700 text-white rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome, {familyData?.motherName || 'Family'}!
        </h1>
        <p className="text-pink-100 text-lg">
          We're here to support you and your family
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Support Status</p>
              <p className="text-lg font-bold text-gray-900">
                {assignedVolunteer ? 'Matched' : 'Pending'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Support Requests</p>
              <p className="text-2xl font-bold text-gray-900">{supportRequests.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed Requests</p>
              <p className="text-2xl font-bold text-gray-900">
                {supportRequests.filter(r => r.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Family Profile */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Family Profile</h2>
            {!editingProfile ? (
              <button
                onClick={() => setEditingProfile(true)}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={updateProfile}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingProfile(false);
                    setProfileEdits(familyData);
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                {editingProfile ? (
                  <input
                    type="email"
                    value={profileEdits.motherEmail || ''}
                    onChange={(e) => setProfileEdits({...profileEdits, motherEmail: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{familyData?.motherEmail || 'Not provided'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                {editingProfile ? (
                  <input
                    type="tel"
                    value={profileEdits.motherPhone || ''}
                    onChange={(e) => setProfileEdits({...profileEdits, motherPhone: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{familyData?.motherPhone || 'Not provided'}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Children</label>
                {editingProfile ? (
                  <input
                    type="number"
                    min="1"
                    value={profileEdits.numberOfChildren || ''}
                    onChange={(e) => setProfileEdits({...profileEdits, numberOfChildren: parseInt(e.target.value)})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>{familyData?.numberOfChildren || 'Not specified'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Baby's Birthday</label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Baby className="w-4 h-4 text-gray-500" />
                  <span>{familyData?.babyBirthday || 'Not specified'}</span>
                </div>
              </div>
            </div>

            {familyData?.address && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                {editingProfile ? (
                  <textarea
                    value={profileEdits.address || ''}
                    onChange={(e) => setProfileEdits({...profileEdits, address: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    rows="2"
                  />
                ) : (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Home className="w-4 h-4 text-gray-500 mt-0.5" />
                    <span>{familyData?.address}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assigned Volunteer */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Your Support Team</h2>
        </div>
        <div className="p-6">
          {assignedVolunteer ? (
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{assignedVolunteer.volunteerName}</h3>
                  <p className="text-sm text-gray-600">Your assigned volunteer</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${assignedVolunteer.volunteerPhone}`} className="hover:text-blue-600">
                    {assignedVolunteer.volunteerPhone || 'No phone'}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${assignedVolunteer.volunteerEmail}`} className="hover:text-blue-600">
                    {assignedVolunteer.volunteerEmail || 'No email'}
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No volunteer assigned yet</p>
              <p className="text-sm text-gray-400 mt-1">
                We're working on matching you with a volunteer. You'll be notified when one is assigned.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Support Requests */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Support Requests</h2>
            <button
              onClick={() => setShowRequestForm(!showRequestForm)}
              className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Request Support
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Request Form */}
          {showRequestForm && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Request Support</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type of Support
                    </label>
                    <select
                      value={newRequest.type}
                      onChange={(e) => setNewRequest({...newRequest, type: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    >
                      <option value="">Select support type</option>
                      {supportTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Urgency
                    </label>
                    <select
                      value={newRequest.urgency}
                      onChange={(e) => setNewRequest({...newRequest, urgency: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    >
                      <option value="low">Low - Can wait a week</option>
                      <option value="normal">Normal - Within a few days</option>
                      <option value="high">High - Within 24 hours</option>
                      <option value="urgent">Urgent - Today</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={newRequest.preferredDate}
                    onChange={(e) => setNewRequest({...newRequest, preferredDate: e.target.value})}
                    className="w-full md:w-1/2 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newRequest.description}
                    onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    rows="4"
                    placeholder="Please describe what kind of help you need..."
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={submitSupportRequest}
                    className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Submit Request
                  </button>
                  <button
                    onClick={() => setShowRequestForm(false)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Request History */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Recent Requests</h3>
            {supportRequests.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No support requests yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Click "Request Support" above when you need help
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {supportRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-gray-900">
                            {supportTypes.find(t => t.value === request.type)?.label || request.type}
                          </h4>
                          <span className={`text-xs px-2 py-1 rounded ${
                            request.urgency === 'urgent' ? 'bg-red-100 text-red-800' :
                            request.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                            request.urgency === 'normal' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {request.urgency}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                        <p className="text-xs text-gray-500">
                          Submitted {new Date(request.createdAt?.toDate?.() || request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          request.status === 'completed' ? 'bg-green-100 text-green-800' :
                          request.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {request.status}
                        </span>
                        {request.status === 'pending' && (
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                        )}
                        {request.status === 'completed' && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
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

export default FamilyPortal;