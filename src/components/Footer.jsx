import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => (
  <footer className="bg-gray-800 text-white py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Essential Mom Assistance</h3>
        <p className="text-gray-300">Supporting families in Silver Spring and beyond</p>
        <div className="mt-4 flex justify-center space-x-6">
          <Mail className="w-5 h-5 text-gray-400" />
          <Phone className="w-5 h-5 text-gray-400" />
          <MapPin className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;