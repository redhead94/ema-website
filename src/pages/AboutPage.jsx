import React from 'react';

const AboutPage = () => (
  <div className="max-w-4xl mx-auto py-12 px-4">
    <div className="text-center mb-12">
      <h1 className="text-3xl font-bold text-gray-800">About EMA</h1>
      <p className="text-lg text-gray-600 mt-2">Essential Mom Assistance</p>
    </div>
    
    <div className="prose prose-lg mx-auto text-gray-600">
      <p>
        Essential Mom Assistance (EMA) was founded with a simple mission: to support new mothers 
        and growing families during one of life's most important transitions. We understand that 
        welcoming a new baby is both joyful and challenging, and we're here to help make that 
        transition smoother.
      </p>
      
      <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Our Services</h2>
      <ul className="space-y-2">
        <li>Meal delivery for new families</li>
        <li>Volunteer Babysitting</li>
        <li>Emotional support and guidance</li>
        <li>Community connection and resources</li>
      </ul>
      
      <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Our Community</h2>
      <p>
        Based in Silver Spring, Maryland, we serve families throughout the greater Washington D.C. 
        area. Our network of volunteers and supporters makes it possible to provide these essential 
        services to families when they need them most.
      </p>
    </div>
  </div>
);

export default AboutPage;