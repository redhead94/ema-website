import React from 'react';
import { Baby, Heart, Users } from 'lucide-react';

const HomePage = ({ setActiveTab }) => (
  <div className="relative">
    {/* Hero Section - Made Responsive */}
    <div className="relative h-64 sm:h-80 md:h-96 bg-gradient-to-r from-blue-50 to-gray-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-pattern opacity-20"></div>
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 sm:mb-6 leading-tight">
          Raise Your Helping Hand
        </h1>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
          We provide essential support for mothers and families in Silver Spring, including 
          meal deliveries and volunteer babysitting, to ensure a smooth and restful 
          transition into parenthood.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <button
            onClick={() => setActiveTab('donate')}
            className="bg-blue-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full text-base sm:text-lg font-medium hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            Donate
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className="bg-white text-gray-700 px-6 sm:px-8 py-2 sm:py-3 rounded-full text-base sm:text-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors w-full sm:w-auto"
          >
            Contact
          </button>
        </div>
      </div>
    </div>

    {/* Features Section - Made Responsive */}
    <div className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">How We Help</h2>
          <p className="text-base sm:text-lg text-gray-600">Supporting families during their most important moments</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="text-center p-4 sm:p-6">
            <div className="bg-blue-100 rounded-full w-12 sm:w-16 h-12 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Heart className="w-6 sm:w-8 h-6 sm:h-8 text-blue-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-3">Meal Delivery</h3>
            <p className="text-sm sm:text-base text-gray-600">Fresh, nutritious meals delivered to new families to reduce stress and ensure proper nutrition.</p>
          </div>
          <div className="text-center p-4 sm:p-6">
            <div className="bg-blue-100 rounded-full w-12 sm:w-16 h-12 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Users className="w-6 sm:w-8 h-6 sm:h-8 text-blue-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-3">Volunteer Babysitting</h3>
            <p className="text-sm sm:text-base text-gray-600">A volunteer to come and help you with watching your baby for an hour.</p>
          </div>
          <div className="text-center p-4 sm:p-6">
            <div className="bg-blue-100 rounded-full w-12 sm:w-16 h-12 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Baby className="w-6 sm:w-8 h-6 sm:h-8 text-blue-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-3">Family Support</h3>
            <p className="text-sm sm:text-base text-gray-600">Emotional support and guidance for new parents navigating the early stages of parenthood.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default HomePage;