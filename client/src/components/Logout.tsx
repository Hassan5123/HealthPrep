'use client';

import { useRouter } from 'next/navigation';

export default function Logout() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear the authentication data from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Trigger storage event manually to notify components about auth state change
    window.dispatchEvent(new Event('storage'));
    
    // Redirect to the login page
    router.push('/login');
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 text-center"
    >
      Logout
    </button>
  );
}