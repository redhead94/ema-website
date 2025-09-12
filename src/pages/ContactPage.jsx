import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import useFormData from '../hooks/useFormData';

const ContactPage = () => {
  // Destructure all needed values from the hook
  const { 
    formData, 
    handleInputChange, 
    handleSubmit, 
    isSubmitting,
    submitMessage 
  } = useFormData();

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-800">Contact Us</h1>
        <p className="text-lg text-gray-600 mt-2">Get in touch with Essential Mom Assistance</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-gray-600">info@essentialmom.net</span>
            </div>
            <div className="flex items-center">
              <Phone className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-gray-600">(301) 923-4815</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-gray-600">Silver Spring, MD</span>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Send us a Message</h2>
          
          {/* Show success/error message */}
          {submitMessage && (
            <div className={`mb-4 p-4 rounded-md ${
              submitMessage.includes('error') || submitMessage.includes('Please fill')
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {submitMessage}
            </div>
          )}

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              value={formData.name || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
            <input
              type="email"
              placeholder="Your Email"
              value={formData.email || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
            <textarea
              rows={4}
              placeholder="Your Message"
              value={formData.message || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => handleInputChange('message', e.target.value)}
            />
            <button
              type="button"
              onClick={() => handleSubmit('Contact Form')}
              disabled={isSubmitting}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;