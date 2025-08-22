import React from 'react';
import { Baby, Heart, Users } from 'lucide-react';

const HomePage = ({ setActiveTab }) => (
  <div className="relative">
    {/* Hero Section */}
    <div className="relative h-96 bg-gradient-to-r from-blue-50 to-gray-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-pattern opacity-20"></div>
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
          Raise Your Helping Hand
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          We provide essential support for mothers and families in Silver Spring, including 
          meal deliveries and home cleaning assistance, to ensure a smooth and restful 
          transition into parenthood.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setActiveTab('donate')}
            className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Donate
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className="bg-white text-gray-700 px-8 py-3 rounded-full text-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Contact
          </button>
        </div>
      </div>
    </div>

    {/* Features Section */}
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">How We Help</h2>
          <p className="text-lg text-gray-600">Supporting families during their most important moments</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Meal Delivery</h3>
            <p className="text-gray-600">Fresh, nutritious meals delivered to new families to reduce stress and ensure proper nutrition.</p>
          </div>
          <div className="text-center p-6">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Home Assistance</h3>
            <p className="text-gray-600">Professional cleaning and home organization services to create a comfortable environment.</p>
          </div>
          <div className="text-center p-6">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Baby className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Family Support</h3>
            <p className="text-gray-600">Emotional support and guidance for new parents navigating the early stages of parenthood.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default HomePage;