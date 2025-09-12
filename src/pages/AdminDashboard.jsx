import React, { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  Users,
  Heart,
  Mail,
  DollarSign,
  Calendar,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  Home,
  Settings,
  LogOut,
  Search,
  Bell,
  Menu,
  X,
  TrendingUp,
  UserPlus,
  MessageSquare,
} from 'lucide-react';
import SMSDashboard from '../components/SMSDashboard';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [data, setData] = useState({
    volunteers: [],
    registrations: [],
    contacts: [],
    donations: [],
  });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVolunteers: 0,
    totalFamilies: 0,
    totalContacts: 0,
    pendingVolunteers: 0,
    totalDonations: 0,
  });

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      setSidebarOpen(window.innerWidth >= 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isMobile &&
        sidebarOpen &&
        !e.target.closest('.sidebar') &&
        !e.target.closest('.menu-button')
      ) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobile, sidebarOpen]);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const collectionsToLoad = ['volunteers', 'registrations', 'contacts', 'donations'];
      const results = { volunteers: [], registrations: [], contacts: [], donations: [] };

      for (const collectionName of collectionsToLoad) {
        const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
        const qs = await getDocs(q);
        results[collectionName] = qs.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
      }

      setData(results);

      // Stats
      setStats({
        totalVolunteers: results.volunteers.length,
        totalFamilies: results.registrations.length,
        totalContacts: results.contacts.length,
        totalDonations: results.donations
          .reduce((total, donation) => total + (donation.amountCents || 0) / 100, 0)
          .toFixed(2),
        pendingVolunteers: results.volunteers.filter((v) => v.status === 'pending').length,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update status helper
  const updateStatus = async (collectionName, docId, newStatus) => {
    try {
      await updateDoc(doc(db, collectionName, docId), { status: newStatus });
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'No date';
    if (timestamp.toDate) return timestamp.toDate().toLocaleDateString();
    return new Date(timestamp).toLocaleDateString();
  };

  const navigation = [
    { id: 'overview', name: 'Overview', icon: Home },
    { id: 'messages', name: 'Messages', icon: MessageCircle },
    { id: 'volunteers', name: 'Volunteers', icon: Users, count: data.volunteers.length },
    { id: 'registrations', name: 'Families', icon: Heart, count: data.registrations.length },
    { id: 'contacts', name: 'Contact Forms', icon: Mail, count: data.contacts.length },
    { id: 'donations', name: 'Donations', icon: DollarSign, count: data.donations.length },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const recentActivity = [
    ...data.volunteers.slice(0, 2).map((v) => ({
      type: 'volunteer',
      name: v.volunteerName,
      action: 'Applied as volunteer',
      time: formatDate(v.createdAt),
    })),
    ...data.registrations.slice(0, 2).map((r) => ({
      type: 'family',
      name: r.motherName,
      action: 'Registered for support',
      time: formatDate(r.createdAt),
    })),
    ...data.donations.slice(0, 2).map((d) => ({
      type: 'donation',
      name: d.donorName || 'Anonymous',
      action: `Donated ${d.amountDisplay || `$${((d.amountCents || 0) / 100).toFixed(2)}`}`,
      time: formatDate(d.createdAt),
    })),
  ].slice(0, 6);

  const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-600 truncate">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1 flex-shrink-0" />
              <span className="text-green-600 font-medium">+{change}</span>
              <span className="text-gray-500 ml-1 hidden sm:inline">this month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl flex-shrink-0 ${color}`}>
          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </div>
      </div>
    </div>
  );

  const ActivityItem = ({ item }) => {
    const getIcon = (type) => {
      switch (type) {
        case 'volunteer':
          return <UserPlus className="h-4 w-4" />;
        case 'family':
          return <Heart className="h-4 w-4" />;
        case 'donation':
          return <DollarSign className="h-4 w-4" />;
        case 'message':
          return <MessageSquare className="h-4 w-4" />;
        default:
          return <Bell className="h-4 w-4" />;
      }
    };
    const getColor = (type) => {
      switch (type) {
        case 'volunteer':
          return 'bg-blue-100 text-blue-600';
        case 'family':
          return 'bg-pink-100 text-pink-600';
        case 'donation':
          return 'bg-green-100 text-green-600';
        case 'message':
          return 'bg-purple-100 text-purple-600';
        default:
          return 'bg-gray-100 text-gray-600';
      }
    };
    return (
      <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors min-h-[60px]">
        <div className={`p-2 rounded-lg flex-shrink-0 ${getColor(item.type)}`}>{getIcon(item.type)}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
          <p className="text-sm text-gray-500 truncate">{item.action}</p>
        </div>
        <span className="text-xs text-gray-400 flex-shrink-0">{item.time}</span>
      </div>
    );
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      active: 'bg-indigo-100 text-blue-800',
      completed: 'bg-gray-100 text-gray-800',
      unread: 'bg-red-100 text-red-800',
      read: 'bg-indigo-100 text-blue-800',
      responded: 'bg-green-100 text-green-800',
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          colors[status] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status || 'unknown'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" />}

      {/* Sidebar */}
      <div className={`sidebar fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          z-50 lg:z-10
          lg:translate-x-0 lg:fixed lg:inset-y-0 lg:left-0`}
        >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Heart className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-900 truncate">EMA Admin</span>
          </div>
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3 flex-1">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (isMobile) setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-3 mb-1 text-left rounded-lg transition-colors min-h-[48px] ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium truncate">{item.name}</span>
              </div>
              {item.count > 0 && (
                <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full flex-shrink-0 min-w-[20px] text-center">
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200 mt-auto">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold">A</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
              <p className="text-xs text-gray-500 truncate">admin@essentialmom.net</p>
            </div>
          </div>
          <button className="w-full flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors min-h-[44px]">
            <LogOut className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">Sign out</span>
          </button>
        </div>
      </div>

      {/* Main Content (always reserve space for sidebar on lg) */}
      <div className="transition-all duration-300 lg:ml-64">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 min-w-0 flex-1">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="menu-button p-2 hover:bg-gray-100 rounded-lg lg:hidden flex-shrink-0"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                  {navigation.find((i) => i.id === activeTab)?.name || 'Dashboard'}
                </h1>
                <p className="text-gray-600 text-sm hidden sm:block">Essential Mom Assistance</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 lg:w-64"
                />
              </div>
              <button
                onClick={fetchData}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-4 sm:p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard title="Total Volunteers" value={stats.totalVolunteers} icon={Users} color="bg-blue-500" />
                <StatCard title="Families Helped" value={stats.totalFamilies} icon={Heart} color="bg-pink-500" />
                <StatCard title="Contact Messages" value={stats.totalContacts} icon={Mail} color="bg-green-500" />
                <StatCard title="Total Donations" value={`$${stats.totalDonations}`} icon={DollarSign} color="bg-purple-500" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="lg:col-span-2">
                  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                      <button className="text-sm text-blue-600 hover:text-blue-700">View all</button>
                    </div>
                    <div className="space-y-1">
                      {recentActivity.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No recent activity</p>
                      ) : (
                        recentActivity.map((item, idx) => <ActivityItem key={idx} item={item} />)
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions + Summary */}
                <div className="space-y-6">
                  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                      <button
                        onClick={() => setActiveTab('messages')}
                        className="w-full flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <MessageCircle className="h-5 w-5 text-blue-600" />
                        <span className="text-blue-700 font-medium">View Messages</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('volunteers')}
                        className="w-full flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                      >
                        <Users className="h-5 w-5 text-green-600" />
                        <span className="text-green-700 font-medium">Manage Volunteers</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('donations')}
                        className="w-full flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                      >
                        <DollarSign className="h-5 w-5 text-purple-600" />
                        <span className="text-purple-700 font-medium">View Donations</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Pending Volunteers</span>
                        <span className="font-semibold text-gray-900">{stats.pendingVolunteers}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Active Families</span>
                        <span className="font-semibold text-gray-900">
                          {data.registrations.filter((r) => r.status === 'active').length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Unread Messages</span>
                        <span className="font-semibold text-gray-900">
                          {data.contacts.filter((c) => c.status === 'unread').length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              style={{ height: 'calc(100vh - 140px)' }}
            >
              <SMSDashboard />
            </div>
          )}

          {/* Volunteers */}
          {activeTab === 'volunteers' && (
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Volunteer Applications</h3>
                {data.volunteers.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No volunteer applications yet.</p>
                ) : (
                  data.volunteers.map((v) => (
                    <div key={v.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50">
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-3">
                        <div className="mb-2 sm:mb-0">
                          <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{v.volunteerName}</h4>
                          <p className="text-xs sm:text-sm text-gray-600">Applied {formatDate(v.createdAt)}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                          <StatusBadge status={v.status} />
                          <select
                            value={v.status || 'pending'}
                            onChange={(e) => updateStatus('volunteers', v.id, e.target.value)}
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
                          <a href={`mailto:${v.volunteerEmail}`} className="hover:text-blue-600 break-all">
                            {v.volunteerEmail}
                          </a>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Phone className="w-3 sm:w-4 h-3 sm:h-4 mr-2" />
                          <a href={`tel:${v.volunteerPhone}`} className="hover:text-blue-600">
                            {v.volunteerPhone}
                          </a>
                        </div>
                        <div className="flex items-center text-gray-600 sm:col-span-2">
                          <Calendar className="w-3 sm:w-4 h-3 sm:h-4 mr-2" />
                          <span className="break-words">
                            {v.availableDays ? v.availableDays.join(', ') : 'No days specified'}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600 sm:col-span-2">
                          <Clock className="w-3 sm:w-4 h-3 sm:h-4 mr-2" />
                          <span className="break-words">
                            {v.availableTimes ? v.availableTimes.join(', ') : 'No times specified'}
                          </span>
                        </div>
                      </div>

                      {v.additionalInfo && (
                        <div className="mt-3 p-2 sm:p-3 bg-gray-50 rounded">
                          <p className="text-xs sm:text-sm text-gray-700">
                            <strong>Additional Info:</strong> {v.additionalInfo}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Registrations */}
          {activeTab === 'registrations' && (
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Family Registrations</h3>
                {data.registrations.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No family registrations yet.</p>
                ) : (
                  data.registrations.map((r) => (
                    <div key={r.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{r.motherName}</h4>
                          <p className="text-sm text-gray-600">Registered {formatDate(r.createdAt)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <StatusBadge status={r.status} />
                          <select
                            value={r.status || 'pending'}
                            onChange={(e) => updateStatus('registrations', r.id, e.target.value)}
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
                          <a href={`mailto:${r.motherEmail}`} className="hover:text-blue-600">
                            {r.motherEmail || 'No email'}
                          </a>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          <a href={`tel:${r.motherPhone}`} className="hover:text-blue-600">
                            {r.motherPhone || 'No phone'}
                          </a>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          {r.numberOfChildren} children
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          Baby born: {r.babyBirthday || 'Not specified'}
                        </div>
                      </div>

                      {r.address && (
                        <div className="mt-3 flex items-start text-gray-600 text-sm">
                          <MapPin className="w-4 h-4 mr-2 mt-0.5" />
                          <span>{r.address}</span>
                        </div>
                      )}

                      {r.dietaryRestrictions && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded">
                          <p className="text-sm text-gray-700">
                            <strong>Dietary Restrictions:</strong> {r.dietaryRestrictions}
                          </p>
                        </div>
                      )}

                      {r.shulAffiliation && (
                        <div className="mt-2 text-sm text-gray-600">
                          <strong>Shul:</strong> {r.shulAffiliation}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Contacts */}
          {activeTab === 'contacts' && (
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Messages</h3>
                {data.contacts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No contact messages yet.</p>
                ) : (
                  data.contacts.map((c) => (
                    <div key={c.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{c.name}</h4>
                          <p className="text-sm text-gray-600">Sent {formatDate(c.createdAt)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <StatusBadge status={c.status} />
                          <select
                            value={c.status || 'unread'}
                            onChange={(e) => updateStatus('contacts', c.id, e.target.value)}
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
                        <a href={`mailto:${c.email}`} className="hover:text-blue-600">
                          {c.email}
                        </a>
                      </div>

                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-700">{c.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Donations */}
          {activeTab === 'donations' && (
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Donations</h3>
                {data.donations.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No donations yet.</p>
                ) : (
                  data.donations.map((d) => (
                    <div key={d.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{d.donorName || 'Anonymous'}</h4>
                          <p className="text-sm text-gray-600">Donated {formatDate(d.createdAt)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <StatusBadge status={d.status} />
                          <span className="text-lg font-bold text-green-600">
                            {d.amountDisplay || `$${((d.amountCents || 0) / 100).toFixed(2)}`}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          <a href={`mailto:${d.donorEmail}`} className="hover:text-blue-600">
                            {d.donorEmail}
                          </a>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          <span>{d.donorPhone || 'No phone'}</span>
                        </div>
                        {d.transactionId && (
                          <div className="flex items-center text-gray-600">
                            <DollarSign className="w-4 h-4 mr-2" />
                            <span className="font-mono text-xs">ID: {d.transactionId}</span>
                          </div>
                        )}
                      </div>

                      {d.donorMessage && (
                        <div className="mt-3 p-3 bg-indigo-50 rounded">
                          <p className="text-sm text-gray-700">
                            <strong>Message:</strong> {d.donorMessage}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
