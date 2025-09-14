import React, { useMemo, useState } from 'react';
import { Menu, X, Search, Heart, Users, Mail, DollarSign, MessageCircle, Home, Settings, LogOut, TrendingUp } from 'lucide-react';
import SMSDashboard from '../components/SMSDashboard';
import { useAdminData, formatDate } from '../hooks/useAdminData';
import VolunteerCard from '../components/admin/VolunteerCard';
import FamilyCard from '../components/admin/FamilyCard';
import DonationCard from '../components/admin/DonationCard';
import ContactCard from '../components/admin/ContactCard';
import SearchAndFilterBar from '../components/admin/SearchAndFilterBar';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  React.useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 1024);
      setSidebarOpen(window.innerWidth >= 1024);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Data & actions
  const { loading, data, stats, actions } = useAdminData();
  const { volunteers, registrations, contacts, donations } = data;
  const { updateStatus, deleteRegistration, handleMatch, handleUnmatch } = actions;

  const [volSearch, setVolSearch] = useState('');
  const [famSearch, setFamSearch] = useState('');

  const filteredVolunteers = useMemo(() => {
    const q = volSearch.trim().toLowerCase();
    if (!q) return volunteers;
    return volunteers.filter(v =>
      (v.volunteerName || '').toLowerCase().includes(q) ||
      (v.volunteerEmail || '').toLowerCase().includes(q) ||
      (v.volunteerPhone || '').includes(q)
    );
  }, [volunteers, volSearch]);

  const filteredFamilies = useMemo(() => {
    const q = famSearch.trim().toLowerCase();
    if (!q) return registrations;
    return registrations.filter(r =>
      (r.motherName || '').toLowerCase().includes(q) ||
      (r.motherEmail || '').toLowerCase().includes(q) ||
      (r.motherPhone || '').includes(q)
    );
  }, [registrations, famSearch]);

  const unassignedFamilies = useMemo(
    () => registrations.filter(r => !r.assignedVolunteer?.volunteerId),
    [registrations]
  );

  const navigation = [
    { id: 'overview', name: 'Overview', icon: Home },
    { id: 'messages', name: 'Messages', icon: MessageCircle },
    { id: 'volunteers', name: 'Volunteers', icon: Users, count: volunteers.length },
    { id: 'registrations', name: 'Families', icon: Heart, count: registrations.length },
    { id: 'contacts', name: 'Contact Forms', icon: Mail, count: contacts.length },
    { id: 'donations', name: 'Donations', icon: DollarSign, count: donations.length },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

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
      {isMobile && sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" />}

      {/* Sidebar */}
      <div className={`sidebar fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          z-50 lg:z-10 lg:translate-x-0 lg:fixed lg:inset-y-0 lg:left-0 flex flex-col`}>
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg" />
            <span className="text-lg font-bold text-gray-900 truncate">EMA Admin</span>
          </div>
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <nav className="mt-6 px-3 flex-1">
          {navigation.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); if (isMobile) setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-3 mb-1 rounded-lg transition
                ${activeTab === item.id ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <item.icon className="h-5 w-5" />
                <span className="font-medium truncate">{item.name}</span>
              </div>
              {item.count > 0 && <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">{item.count}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t mt-auto">
          <button className="w-full flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Sign out</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="transition-all duration-300 lg:ml-64">
        {/* Top bar (sticky) */}
        <div className="bg-white shadow-sm border-b px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="menu-button p-2 hover:bg-gray-100 rounded-lg lg:hidden">
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                  {navigation.find(i => i.id === activeTab)?.name || 'Dashboard'}
                </h1>
                <p className="text-gray-600 text-sm hidden sm:block">Essential Mom Assistance</p>
              </div>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm" onClick={() => window.location.reload()}>
              Refresh
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard title="Total Volunteers" value={stats.totalVolunteers} icon={Users} color="bg-blue-500" />
                <StatCard title="Families Helped" value={stats.totalFamilies} icon={Heart} color="bg-pink-500" />
                <StatCard title="Contact Messages" value={stats.totalContacts} icon={Mail} color="bg-green-500" />
                <StatCard title="Total Donations" value={`$${stats.totalDonations}`} icon={DollarSign} color="bg-purple-500" />
              </div>
              {/* ...keep your recent activity / quick actions as before if you like */}
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
              <SMSDashboard />
            </div>
          )}

          {activeTab === 'volunteers' && (
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border">
              <SearchAndFilterBar search={volSearch} setSearch={setVolSearch} />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredVolunteers.length === 0 ? (
                  <p className="text-gray-500">No volunteers found.</p>
                ) : (
                  filteredVolunteers.map(v => (
                    <VolunteerCard
                      key={v.id}
                      v={v}
                      onUpdateStatus={(id, s) => updateStatus('volunteers', id, s)}
                      onUnmatch={handleUnmatch}
                      onAssignFamily={handleMatch}
                      unassignedFamilies={unassignedFamilies}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'donations' && (
  <div className="bg-white p-6 rounded-2xl shadow-sm border">
    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
      {donations.length === 0 ? (
        <p className="text-gray-500">No donations yet.</p>
      ) : (
        donations.map((d) => (
          <DonationCard key={d.id} d={d} formatDate={formatDate} />
        ))
      )}
    </div>
  </div>
)}

        {activeTab === 'contacts' && (
  <div className="bg-white p-6 rounded-2xl shadow-sm border">
    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
      {contacts.length === 0 ? (
        <p className="text-gray-500">No contact messages yet.</p>
      ) : (
        contacts.map((c) => (
          <ContactCard
            key={c.id}
            c={c}
            formatDate={formatDate}
            onUpdateStatus={updateStatus}
          />
        ))
      )}
    </div>
  </div>
)}


          {activeTab === 'registrations' && (
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border">
              <SearchAndFilterBar search={famSearch} setSearch={setFamSearch} />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredFamilies.length === 0 ? (
                  <p className="text-gray-500">No families found.</p>
                ) : (
                  filteredFamilies.map(r => (
                    <FamilyCard
                      key={r.id}
                      r={r}
                      volunteers={volunteers}
                      onUpdateStatus={(id, s) => updateStatus('registrations', id, s)}
                      onDelete={deleteRegistration}
                      onMatch={handleMatch}
                      onUnmatch={handleUnmatch}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Keep your Contacts and Donations tabs as you already have, or similarly refactor later */}
        </div>
      </div>
    </div>
  );
}
