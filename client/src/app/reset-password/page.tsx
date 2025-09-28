'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ResetPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  // Check if user is already logged in, redirect to dashboard if they are
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      
      <div className="max-w-md mx-auto pt-20 pb-12 px-4 sm:px-6">
        <div className="bg-white shadow-xl rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Reset Password</h1>
            <p className="text-slate-600 mt-2">
              {!submitted 
                ? 'Enter your email to receive a password reset link' 
                : 'Check your email for reset instructions'}
            </p>
          </div>
          
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
              >
                Send Reset Link
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="bg-green-50 text-green-800 p-4 rounded-lg">
                <p>Password reset instructions have been sent to your email address.</p>
                <p className="mt-2 text-sm">
                  (This is a placeholder - actual functionality will be implemented later)
                </p>
              </div>
              
              <button
                onClick={() => setSubmitted(false)}
                className="text-blue-600 hover:text-blue-800"
              >
                Try again
              </button>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <p className="text-slate-600">
              Remember your password?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}