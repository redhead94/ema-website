import React, { useEffect, useState } from 'react';
import { Phone, MessageCircle, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { useAuth } from './AuthProvider';

// Login Form Component
export const LoginForm = () => {
  const [step, setStep] = useState('phone'); // 'phone' or 'code'
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  
  const { login } = useAuth();

  const sendCode = async () => {
    if (!phone.trim()) {
      setError('Please enter your phone number');
      return;
    }

    setLoading(true);
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
      setLoading(false);
    }
  };

  const verifyCodeAndLogin = async () => {
  if (!code.trim()) {
    setError('Please enter the verification code');
    return;
  }

  setLoading(true);
  setError('');

  try {
    console.log('Sending verification request...');
    
    const response = await fetch('/api/auth/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code })
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
    
    if (data.success) {
      localStorage.setItem('ema_token', data.token);
      
      // Redirect based on user type
      if (data.user.type === 'volunteer') {
        console.log('Redirecting to volunteer portal...');
        window.location.href = '/portal/volunteer';
      } else if (data.user.type === 'family') {
        console.log('Redirecting to family portal...');
        window.location.href = '/portal/family';
      } else {
        setError('Unknown user type received');
      }
    } else {
      setError(data.error);
    }
  } catch (error) {
    console.error('Verification error:', error);
    setError('Network error. Please try again.');
  } finally {
    setLoading(false);
  }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to EMA</h1>
          <p className="text-gray-600">
            {step === 'phone' 
              ? 'Enter your phone number to sign in' 
              : 'Enter the verification code sent to your phone'
            }
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {codeSent && step === 'code' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-700">
              Verification code sent to {phone}
            </p>
          </div>
        )}

        {/* Phone Number Step */}
        {step === 'phone' && (
          <div className="space-y-6">
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
                  placeholder="(555) 123-4567"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  maxLength={14}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Use the phone number you registered with EMA
              </p>
            </div>

            <button
              onClick={sendCode}
              disabled={loading || !phone.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Send Code
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Verification Code Step */}
        {step === 'code' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={code}
                onChange={handleCodeChange}
                placeholder="123456"
                className="w-full text-center text-2xl font-mono py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all tracking-widest"
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
                disabled={loading || code.length !== 6}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Verify & Sign In
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
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Need help? Contact EMA support
          </p>
        </div>
      </div>
    </div>
  );
};