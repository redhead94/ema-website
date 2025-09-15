import React, { useState } from "react";
import PropTypes from "prop-types";
import { Lock, User, Eye, EyeOff, Phone, MessageCircle, ArrowRight, Check, AlertCircle } from "lucide-react";

export default function Login({ onLoginSuccess }) {
  const [loginType, setLoginType] = useState('admin'); // 'admin' or 'portal'
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Portal login state
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' or 'code'
  const [codeSent, setCodeSent] = useState(false);

  const validateAdmin = () => {
    if (!credentials.username.trim()) return "Username is required";
    if (!credentials.password) return "Password is required";
    if (credentials.password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    setError("");
    const v = validateAdmin();
    if (v) {
      setError(v);
      return;
    }
    setIsLoading(true);

    setTimeout(() => {
      const isDemoMatch =
        credentials.username === "admin" && credentials.password === "ema@11420";

      if (isDemoMatch) {
        localStorage.setItem("ema_admin_authenticated", "true");
        localStorage.setItem("ema_admin_login_time", String(Date.now()));
        onLoginSuccess?.();
      } else {
        setError("Invalid username or password");
      }
      setIsLoading(false);
    }, 500);
  };

  const sendCode = async () => {
    if (!phone.trim()) {
      setError('Please enter your phone number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });

      const data = await response.json();
      
      if (data.success) {
        setStep('code');
        setCodeSent(true);
      } else {
        setError(data.error || 'Failed to send verification code');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCodeAndLogin = async () => {
    if (!code.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code })
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('ema_token', data.token);
        // Redirect based on user type
        if (data.user.type === 'volunteer') {
          window.location.href = '/portal/volunteer';
        } else if (data.user.type === 'family') {
          window.location.href = '/portal/family';
        }
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const formatPhoneNumber = (value) => {
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
    setError('');
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/[^\d]/g, '').slice(0, 6);
    setCode(value);
    setError('');
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  return (
    <div className="min-h-[70vh] flex items-start sm:items-center justify-center px-4 pt-8 pb-16 bg-white">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
            {loginType === 'admin' ? (
              <Lock className="h-6 w-6 text-blue-600" aria-hidden="true" />
            ) : (
              <MessageCircle className="h-6 w-6 text-blue-600" aria-hidden="true" />
            )}
          </div>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">
            {loginType === 'admin' ? 'Admin Login' : 'Portal Access'}
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            {loginType === 'admin' 
              ? 'Sign in to the admin dashboard' 
              : step === 'phone'
                ? 'Enter your phone number to access your portal'
                : 'Enter the verification code sent to your phone'
            }
          </p>
        </div>

        {/* Login Type Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => {
              setLoginType('admin');
              setError('');
              setStep('phone');
              setCodeSent(false);
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              loginType === 'admin'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Admin Login
          </button>
          <button
            onClick={() => {
              setLoginType('portal');
              setError('');
              setCredentials({ username: '', password: '' });
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              loginType === 'portal'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Volunteer/Family Portal
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Success Message for Portal */}
        {loginType === 'portal' && codeSent && step === 'code' && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-700">
              Verification code sent to {phone}
            </p>
          </div>
        )}

        {/* Card */}
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
          
          {/* Admin Login */}
          {loginType === 'admin' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={credentials.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, handleAdminSubmit)}
                    className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter username"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={credentials.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, handleAdminSubmit)}
                    className="appearance-none relative block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={handleAdminSubmit}
                disabled={isLoading}
                className="relative w-full flex justify-center py-2.5 px-4 text-sm font-semibold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Signing in…
                  </span>
                ) : (
                  "Sign In to Admin"
                )}
              </button>
            </div>
          )}

          {/* Portal Login */}
          {loginType === 'portal' && (
            <div className="space-y-6">
              {/* Phone Number Step */}
              {step === 'phone' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={handlePhoneChange}
                        onKeyPress={(e) => handleKeyPress(e, sendCode)}
                        placeholder="(555) 123-4567"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        maxLength={14}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Use the phone number you registered with EMA
                    </p>
                  </div>

                  <button
                    onClick={sendCode}
                    disabled={isLoading || !phone.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-md transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Send Code
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </>
              )}

              {/* Verification Code Step */}
              {step === 'code' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={handleCodeChange}
                      onKeyPress={(e) => handleKeyPress(e, verifyCodeAndLogin)}
                      placeholder="123456"
                      className="w-full text-center text-2xl font-mono py-3 px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all tracking-widest"
                      maxLength={6}
                      autoFocus
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Enter the 6-digit code sent to {phone}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={verifyCodeAndLogin}
                      disabled={isLoading || code.length !== 6}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-md transition-all flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          Verify & Access Portal
                          <Check className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setStep('phone');
                        setCode('');
                        setError('');
                        setCodeSent(false);
                      }}
                      className="w-full text-gray-600 hover:text-gray-800 py-2 text-sm transition-colors"
                    >
                      Use different phone number
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            {loginType === 'admin' 
              ? 'Need access? Contact the system administrator'
              : 'Need help? Contact EMA support'
            }
          </p>
        </div>
      </div>
    </div>
  );
}

Login.propTypes = {
  onLoginSuccess: PropTypes.func,
};