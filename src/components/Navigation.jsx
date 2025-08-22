import React, { useState } from 'react';
import { Menu, X, LogIn, LogOut } from 'lucide-react';

const Navigation = ({ activeTab, setActiveTab, isAuthenticated, onLoginClick, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-gray-800">EMA</h1>
            <p className="text-sm text-gray-600">Essential Mom Assistance</p>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {['Home', 'Donate', 'Volunteer', 'Register', 'About', 'Contact'].map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveTab(item.toLowerCase())}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === item.toLowerCase()
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  {item}
                </button>
              ))}
              
              {/* AUTH BUTTONS */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`px-3 py-2 text-sm font-medium transition-colors bg-blue-100 rounded ${
                      activeTab === 'admin'
                        ? 'text-blue-600 bg-blue-200'
                        : 'text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={onLogout}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={onLoginClick}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors bg-gray-100 rounded hover:bg-gray-200"
                >
                  <LogIn className="w-4 h-4 mr-1" />
                   Login
                </button>
              )}
            </div>
          </div>
          
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {['Home', 'Donate', 'Volunteer', 'Register', 'About', 'Contact'].map((item) => (
              <button
                key={item}
                onClick={() => {
                  setActiveTab(item.toLowerCase());
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
              >
                {item}
              </button>
            ))}
            
            {/* MOBILE AUTH BUTTONS */}
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => {
                    setActiveTab('admin');
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-blue-700 hover:bg-blue-50 bg-blue-50"
                >
                  Admin Dashboard
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  onLoginClick();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 bg-gray-50"
              >
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;