import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import VolunteerPage from './pages/VolunteerPage';
import DonatePage from './pages/DonatePage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import AdminDashboard from './pages/AdminDashboard';
import ThankYouPage from './pages/ThankYouPage';
import Login from './pages/Login';
import useFormData from './hooks/useFormData'


const App = () => {
    const { handleStripeDonationResult } = useFormData(); 
     const getInitialTab = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const status = urlParams.get('status');
        const sessionId = urlParams.get('session_id');
        
        if (status === 'success' && sessionId) {
          return 'thank-you';
        }
        return 'home';
      };

  const [activeTab, setActiveTab] = useState(getInitialTab());

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // Process donation after component mounts (if needed)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const sessionId = urlParams.get('session_id');
    
    if (status === 'success' && sessionId) {
      const processDonation = async () => {
        try {
          const response = await fetch(`/api/get-checkout-session?session_id=${encodeURIComponent(sessionId)}`);
          const sessionData = await response.json();
          
          if (response.ok && (sessionData?.status === 'paid' || sessionData?.payment_status === 'paid')) {
            await handleStripeDonationResult(sessionData);
          }
        } catch (error) {
          console.error('Error processing donation:', error);
        }
      };
      
      processDonation();
    }
  }, [handleStripeDonationResult]);

  // Check authentication on mount
  useEffect(() => {
    const authenticated = localStorage.getItem('ema_admin_authenticated');
    const loginTime = localStorage.getItem('ema_admin_login_time');
    
    if (authenticated === 'true' && loginTime) {
      // Check if login is still valid (24 hours)
      const hoursSinceLogin = (Date.now() - parseInt(loginTime)) / (1000 * 60 * 60);
      
      if (hoursSinceLogin < 24) {
        setIsAuthenticated(true);
      } else {
        // Session expired
        handleLogout();
      }
    }
  }, []);

  // Handle successful login
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setShowLogin(false);
    setActiveTab('admin');
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('ema_admin_authenticated');
    localStorage.removeItem('ema_admin_login_time');
    setActiveTab('home');
  };

  // Handle login button click - navigate to login page
  const handleLoginClick = () => {
    setActiveTab('login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage setActiveTab={setActiveTab} />;
      case 'register':
        return <RegisterPage />;
      case 'volunteer':
        return <VolunteerPage />;
      case 'donate':
        return <DonatePage />;
      case 'contact':
        return <ContactPage />;
      case 'about':
        return <AboutPage />;
      case 'login':
        return <Login onLoginSuccess={handleLoginSuccess} />;
      case 'thank-you':
        return <ThankYouPage setActiveTab={setActiveTab} />;
      case 'admin':
        return isAuthenticated ? <AdminDashboard /> : <HomePage setActiveTab={setActiveTab} />;
      default:
        return <HomePage setActiveTab={setActiveTab} />;
    }
  };

  // Don't show Navigation and Footer for admin dashboard
  if (activeTab === 'admin' && isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-800">EMA Admin</h1>
                <p className="text-sm text-gray-600">Essential Mom Assistance</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setActiveTab('home')}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Back to Site
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors bg-gray-100 rounded hover:bg-gray-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isAuthenticated={isAuthenticated}
        onLoginClick={handleLoginClick}
        onLogout={handleLogout}
      />
      <main className="pb-8">
        {renderContent()}
      </main>
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;