import React, { useEffect, useState } from 'react';
import { CheckCircle, Heart, Download, ArrowLeft } from 'lucide-react';

const ThankYouPage = ({ setActiveTab }) => {
  const [donationDetails, setDonationDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  const processDonation = async () => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const status = params.get('status');

    if (status === 'success' && sessionId) {
      try {
        // Just fetch session details - don't process the donation again
        const response = await fetch(`/api/get-checkout-session?session_id=${encodeURIComponent(sessionId)}`);
        const sessionData = await response.json();

        if (response.ok && (sessionData?.status === 'paid' || sessionData?.payment_status === 'paid')) {
          // Just display the details - donation was already processed
          setDonationDetails({
            amount: `$${(sessionData.amount_total / 100).toFixed(2)}`,
            donorName: sessionData.donor_name || 'Anonymous',
            transactionId: sessionData.session_id,
            receiptUrl: sessionData.receipt_url,
            donorEmail: sessionData.customer_email
          });
        } else {
          setError('Unable to retrieve donation details.');
        }
      } catch (err) {
        setError('Error retrieving donation information.');
      }
    } else if (status === 'cancelled') {
      setError('Donation was cancelled.');
    } else {
      setError('Invalid donation session.');
    }

    setLoading(false);
    window.history.replaceState({}, '', window.location.pathname);
  };


  processDonation();
}, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your donation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => setActiveTab('donate')}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Donations
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          {/* Main Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Thank You for Your Generosity!
          </h1>
          
          <div className="flex items-center justify-center mb-6">
            <Heart className="w-6 h-6 text-red-500 mr-2" />
            <p className="text-lg text-gray-600">
              Your donation helps support families in their time of need
            </p>
          </div>

          {/* Donation Details */}
          {donationDetails && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Donation Details</h2>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-semibold text-green-600 text-lg">{donationDetails.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Donor:</span>
                  <span className="font-medium">{donationDetails.donorName}</span>
                </div>
                {donationDetails.donorEmail && (
                  <div className="flex justify-between">
                    <span>Tax Deductible Receipt sent to:</span>
                    <span className="font-medium">{donationDetails.donorEmail}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Receipt Download */}
          {donationDetails?.receiptUrl && (
            <div className="mb-6">
              <a
                href={donationDetails.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Receipt
              </a>
            </div>
          )}

          {/* Impact Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              <strong>Your Impact:</strong> This donation will help provide meals, babysitting services, 
              and emotional support to new families in the Silver Spring, MD area. Thank you for being 
              part of our community of care.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setActiveTab('home')}
              className="inline-flex items-center justify-center bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </button>
            <button
              onClick={() => setActiveTab('donate')}
              className="inline-flex items-center justify-center border border-indigo-600 text-indigo-600 px-6 py-3 rounded-md hover:bg-indigo-50 transition-colors font-medium"
            >
              <Heart className="w-4 h-4 mr-2" />
              Donate Again
            </button>
          </div>

          {/* Contact Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Questions about your donation? Contact us at{' '}
              <a href="mailto:info@essentialmom.net" className="text-blue-600 hover:underline">
                info@essentialmom.net
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;