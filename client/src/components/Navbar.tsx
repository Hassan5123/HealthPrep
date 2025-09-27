'use client';

import React from 'react';

export default function Navbar() {
  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
              {/* Medical cross icon */}
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <a href="/" className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
              HealthPrep
            </a>
          </div>
          
          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <a href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 text-center">
              Login
            </a>
            <a href="/register" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 text-center">
              Register
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}