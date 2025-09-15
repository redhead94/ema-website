import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
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
import useFormData from './hooks/useFormData';

// Import new auth components
import { AuthProvider } from './components/auth/AuthProvider';
import { LoginForm } from './components/auth/LoginForm';
import { ProtectedRoute as UserProtectedRoute } from './components/auth/ProtectedRoute';
import { UserLayout } from './components/layouts/UserLayout';

// Import new portal components (we'll create these next)
import VolunteerPortal from './pages/VolunteerPortal';
import FamilyPortal from './pages/FamilyPortal';

// Component to handle Stripe redirect processing
const StripeHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleStripeDonationResult } = useFormData();

  useEffect(() => {
    const status = searchParams.get('status');
    const sessionId = searchParams.get('session_id');
    
    if (status === 'success' && sessionId) {
      const processDonation = async () => {
        try {
          const response = await fetch(`/api/get-checkout-session?session_id=${encodeURIComponent(sessionId)}`);
          const sessionData = await response.json();
          
          if (response.ok && (sessionData?.status === 'paid' || sessionData?.payment_status === 'paid')) {
            await handleStripeDonationResult(sessionData);
            navigate('/thank-you');
          }
        } catch (error) {
          console.error('Error processing donation:', error);
          navigate('/');
        }
      };
      
      processDonation();
    } else {
      navigate('/');
    }
  }, [searchParams, navigate, handleStripeDonationResult]);

  return <div>Processing...</div>;
};

// Protected route component for admin (existing)
const AdminProtectedRoute = ({ children, isAuthenticated }) => {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Admin layout component (existing)
const AdminLayout = ({ children, onLogout, onBackToSite }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* FIXED top admin bar */}
      <header className="fixed top-0 inset-x-0 z-30 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-gray-800">EMA Admin</h1>
              <p className="text-sm text-gray-600">Essential Mom Assistance</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={onBackToSite}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Back to Site
              </button>
              <button
                onClick={onLogout}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors bg-gray-100 rounded hover:bg-gray-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Reserve space for the fixed bar (h-16 = 64px) */}
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
};

// Main app content component
const AppContent = () => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check admin authentication on mount
  useEffect(() => {
    const authenticated = localStorage.getItem('ema_admin_authenticated');
    const loginTime = localStorage.getItem('ema_admin_login_time');
    
    if (authenticated === 'true' && loginTime) {
      // Check if login is still valid (24 hours)
      const hoursSinceLogin = (Date.now() - parseInt(loginTime)) / (1000 * 60 * 60);
      
      if (hoursSinceLogin < 24) {
        setIsAdminAuthenticated(true);
      } else {
        // Session expired
        handleAdminLogout();
      }
    }
  }, []);

  // Handle successful admin login
  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    navigate('/admin');
  };

  // Handle admin logout
  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('ema_admin_authenticated');
    localStorage.removeItem('ema_admin_login_time');
    navigate('/');
  };

  // Handle back to site from admin
  const handleBackToSite = () => {
    navigate('/');
  };

  return (
    <Routes>
      {/* Public routes with navigation and footer */}
      <Route
        path="/*"
        element={
          <div className="min-h-screen bg-gray-50">
            <Navigation isAuthenticated={isAdminAuthenticated} onLogout={handleAdminLogout} />
            <main className="pb-8">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/volunteer" element={<VolunteerPage />} />
                <Route path="/donate" element={<DonatePage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/thank-you" element={<ThankYouPage />} />
                <Route path="/stripe-handler" element={<StripeHandler />} />
                <Route path="/login" element={<Login onLoginSuccess={handleAdminLoginSuccess} />} />
                
                {/* User portal login - separate from admin login */}
                <Route path="/portal/login" element={<LoginForm />} />
              </Routes>
            </main>
            <Footer />
          </div>
        }
      />

      {/* Admin routes without navigation and footer */}
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute isAuthenticated={isAdminAuthenticated}>
            <AdminLayout onLogout={handleAdminLogout} onBackToSite={handleBackToSite}>
              <AdminDashboard />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />

      {/* Volunteer portal routes */}
      <Route
        path="/portal/volunteer/*"
        element={
          <UserProtectedRoute requiredType="volunteer">
            <UserLayout title="Volunteer Portal">
              <VolunteerPortal />
            </UserLayout>
          </UserProtectedRoute>
        }
      />

      {/* Family portal routes */}
      <Route
        path="/portal/family/*"
        element={
          <UserProtectedRoute requiredType="family">
            <UserLayout title="Family Portal">
              <FamilyPortal />
            </UserLayout>
          </UserProtectedRoute>
        }
      />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;