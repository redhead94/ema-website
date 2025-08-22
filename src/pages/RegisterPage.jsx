import React from 'react';
import useFormData from '../hooks/useFormData';

const RegisterPage = () => {
  // Make sure to destructure ALL the values you need from the hook
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Register</h1>
        <p className="text-lg text-gray-600">Mazal Tov!</p>
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
            Mother's Name (First, Last) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.motherName || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => handleInputChange('motherName', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mother's Email</label>
          <input
            type="email"
            value={formData.motherEmail || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => handleInputChange('motherEmail', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mother's Phone</label>
          <input
            type="tel"
            value={formData.motherPhone || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => handleInputChange('motherPhone', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={formData.address || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => handleInputChange('address', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Baby's Birthday</label>
          <input
            type="date"
            value={formData.babyBirthday || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => handleInputChange('babyBirthday', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Children (including baby) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            required
            min="1"
            value={formData.numberOfChildren || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => handleInputChange('numberOfChildren', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Restrictions</label>
          <textarea
            rows={4}
            value={formData.dietaryRestrictions || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Please list any dietary restrictions, allergies, or preferences..."
            onChange={(e) => handleInputChange('dietaryRestrictions', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Meal Train URL</label>
          <input
            type="url"
            value={formData.mealTrainUrl || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://"
            onChange={(e) => handleInputChange('mealTrainUrl', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Shul Affiliation</label>
          <input
            type="text"
            value={formData.shulAffiliation || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => handleInputChange('shulAffiliation', e.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={() => handleSubmit('Family Registration')}
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  );
};

export default RegisterPage;