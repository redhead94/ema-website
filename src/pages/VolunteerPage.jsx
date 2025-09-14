import React from 'react';
import useFormData from '../hooks/useFormData';

const VolunteerPage = () => {
  // Destructure all needed values from the hook
  const { 
    formData, 
    handleInputChange, 
    handleSubmit,
    isSubmitting,
    submitMessage 
  } = useFormData();

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Volunteer</h1>
        <p className="text-lg text-gray-600 mt-2">Join our community of helpers</p>
      </div>
      
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.volunteerName || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => handleInputChange('volunteerName', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            value={formData.volunteerEmail || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => handleInputChange('volunteerEmail', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            required
            value={formData.volunteerPhone || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => handleInputChange('volunteerPhone', e.target.value)}
          />
        </div>

        {/* NEW: Best Way to Contact */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Best Way to Contact You <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {[
              { value: 'call', label: 'Phone Call' },
              { value: 'text', label: 'Text Message' }
            ].map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  name="contactMethod"
                  value={option.value}
                  checked={formData.bestContactMethod === option.value}
                  className="text-blue-600 focus:ring-blue-500 focus:ring-2"
                  onChange={(e) => handleInputChange('bestContactMethod', e.target.value)}
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Available Day(s) <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
              <label key={day} className="flex items-center">
                <input
                  type="checkbox"
                  checked={(formData.availableDays || []).includes(day)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                  onChange={(e) => {
                    const currentDays = formData.availableDays || [];
                    if (e.target.checked) {
                      handleInputChange('availableDays', [...currentDays, day]);
                    } else {
                      handleInputChange('availableDays', currentDays.filter(d => d !== day));
                    }
                  }}
                />
                <span className="ml-2 text-sm text-gray-700">{day}</span>
              </label>
            ))}
          </div>
        </div>

        {/* NEW: Available Times Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Available Time(s) <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              'Early Morning (6-9 AM)',
              'Morning (9 AM-12 PM)', 
              'Afternoon (12-3 PM)',
              'Late Afternoon (3-6 PM)',
              'Evening (6-9 PM)',
              'Night (9 PM-12 AM)'
            ].map((time) => (
              <label key={time} className="flex items-center">
                <input
                  type="checkbox"
                  checked={(formData.availableTimes || []).includes(time)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                  onChange={(e) => {
                    const currentTimes = formData.availableTimes || [];
                    if (e.target.checked) {
                      handleInputChange('availableTimes', [...currentTimes, time]);
                    } else {
                      handleInputChange('availableTimes', currentTimes.filter(t => t !== time));
                    }
                  }}
                />
                <span className="ml-2 text-sm text-gray-700">{time}</span>
              </label>
            ))}
          </div>
        </div>



        {/* NEW: Additional Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Information (Optional)
          </label>
          <textarea
            rows={4}
            value={formData.additionalInfo || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Tell us about any special skills, experience with children, dietary restrictions when cooking, etc."
            onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={() => handleSubmit('Volunteer Application')}
          disabled={isSubmitting}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </div>
    </div>
  );
};

export default VolunteerPage;