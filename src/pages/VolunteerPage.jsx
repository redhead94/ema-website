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

        <button
          type="button"
          onClick={() => handleSubmit('Volunteer Application')}
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  );
};

export default VolunteerPage;