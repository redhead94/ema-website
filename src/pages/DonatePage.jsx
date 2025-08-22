import React from 'react';
import { CreditCard } from 'lucide-react';
import useFormData from '../hooks/useFormData';

const DonatePage = () => {
  // Destructure all needed values from the hook
  const { 
    formData, 
    handleInputChange,
    handleDonationSubmit,
    isSubmitting,
    submitMessage 
  } = useFormData();

  // For now, this is a placeholder that simulates donation processing
  // Later this will be replaced with actual Stripe integration
  const handleDonationFlow = async () => {
    // Validate required fields
    if (!formData.donationAmount || !formData.donorName || !formData.donorEmail) {
      alert('Please fill in all required fields.');
      return;
    }

    // Simulate payment processing (replace with Stripe later)
    const mockPaymentSuccess = true; // This would come from Stripe
    const mockTransactionId = `txn_${Date.now()}`; // This would come from Stripe

    if (mockPaymentSuccess) {
      // Send confirmation email
      const donationData = {
        donorName: formData.donorName,
        donorEmail: formData.donorEmail,
        amount: formData.donationAmount,
        transactionId: mockTransactionId
      };

      await handleDonationSubmit(donationData);
    } else {
      alert('Payment failed. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Donate</h1>
        <p className="text-lg text-gray-600 mt-2">Support families in their time of need</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Show success/error message */}
        {submitMessage && (
          <div className={`mb-6 p-4 rounded-md ${
            submitMessage.includes('error') || submitMessage.includes('Please fill')
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {submitMessage}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Donation Amount <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[25, 50, 100, 250].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  className={`p-3 border rounded-md transition-colors ${
                    formData.donationAmount === amount
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                  }`}
                  onClick={() => handleInputChange('donationAmount', amount)}
                >
                  ${amount}
                </button>
              ))}
            </div>
            <input
              type="number"
              placeholder="Custom amount"
              value={formData.donationAmount || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => handleInputChange('donationAmount', e.target.value)}
            />
          </div>

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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone (Optional)
            </label>
            <input
              type="tel"
              value={formData.donorPhone || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => handleInputChange('donorPhone', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Message (Optional)
            </label>
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
              <h3 className="text-lg font-medium text-gray-800">Payment Information</h3>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> This is currently a demo. When you click "Process Donation" below, 
                it will simulate a successful payment and send you a confirmation email. Stripe integration 
                will be added next for real payment processing.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDonationFlow}
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            {isSubmitting ? 'Processing...' : 'Process Donation'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonatePage;