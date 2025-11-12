import React, { useState, useMemo } from 'react';
import { CreditCard } from 'lucide-react';
import useFormData from '../hooks/useFormData';

// function formatMoney(cents, currency = 'usd') {
//   const amount = (Number(cents || 0) / 100);
//   try {
//     return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(amount);
//   } catch {
//     return `$${amount.toFixed(2)}`;
//   }
// }

const DonatePage = () => {
  const { formData, handleInputChange } = useFormData();
  const [notice, setNotice] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Handle cancelled donations from URL params
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    
    if (status === 'cancelled') {
      setNotice({ type: 'warn', msg: 'Donation was cancelled. You can try again below.' });
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const amountInDollars = useMemo(() => Number(formData.donationAmount || 0), [formData.donationAmount]);

  async function handleDonateReal() {
    setNotice(null);

    if (!amountInDollars || !formData.donorName || !formData.donorEmail) {
      setNotice({ type: 'error', msg: 'Please fill in amount, name, and email.' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        amount: Math.round(amountInDollars * 100), // cents
        currency: 'usd',
        donor: {
          name: formData.donorName,
          email: formData.donorEmail,
          phone: formData.donorPhone || '',
          message: formData.donorMessage || '',
        },
      };

      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data?.url) {
        window.location.href = data.url; // redirect to Stripe Checkout
      } else {
        setNotice({ type: 'error', msg: 'Error starting checkout. Please try again.' });
      }
    } catch (e) {
      setNotice({ type: 'error', msg: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Donate</h1>
        <p className="text-lg text-gray-600 mt-2">Support families in their time of need</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
        {/* Notice banner */}
        {notice && (
          <div
            className={
              `mb-6 p-4 rounded-md border ` +
              (notice.type === 'success'
                ? 'bg-green-50 text-green-800 border-green-200'
                : notice.type === 'warn'
                ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
                : notice.type === 'info'
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : 'bg-red-50 text-red-700 border-red-200')
            }
            role="status"
          >
            <div>{notice.msg}</div>
          </div>
        )}

        <div className="space-y-6">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Donation Amount <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[25, 50, 100, 250].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  className={`p-3 border rounded-md transition-colors ${
                    Number(formData.donationAmount) === amt 
                      ? 'bg-blue-50 border-blue-300 text-blue-700' 
                      : 'border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                  }`}
                  onClick={() => handleInputChange('donationAmount', amt)}
                >
                  ${amt}
                </button>
              ))}
            </div>
            <input
              type="number"
              inputMode="decimal"
              min="1"
              step="0.01"
              placeholder="Custom amount"
              value={formData.donationAmount || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => handleInputChange('donationAmount', e.target.value)}
            />
          </div>

          {/* Donor details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.donorName || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => handleInputChange('donorName', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.donorEmail || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) => handleInputChange('donorEmail', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone (optional)</label>
              <input
                type="tel"
                value={formData.donorPhone || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) => handleInputChange('donorPhone', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Special Message (optional)</label>
            <textarea
              rows={3}
              value={formData.donorMessage || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Leave a message of support..."
              onChange={(e) => handleInputChange('donorMessage', e.target.value)}
            />
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center mb-4">
              <CreditCard className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Payment</h3>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-blue-800 text-sm">
                You'll be redirected to a secure Stripe Checkout page to complete your donation.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDonateReal}
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Processing...' : 'Donate'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonatePage;