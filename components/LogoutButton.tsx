// components/LogoutButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { LogOut, User } from 'lucide-react';

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [shouldShow, setShouldShow] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Hide logout button on PDF pages to avoid overlapping with download buttons
    const hiddenPages = ['/PackingSlipPDF', '/InvoicePDF'];
    setShouldShow(!hiddenPages.includes(pathname));
  }, [pathname]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      // Clear uploaded file data from localStorage before logout
      localStorage.removeItem('t2_invoice_data');
      
      // Also clear any other session data
      localStorage.clear();
      
      const res = await fetch('/api/logout', { method: 'POST' });
      if (res.ok) {
        // Add a small delay to ensure localStorage is cleared before redirect
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="relative">
        {/* User Avatar/Button */}
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 shadow-sm transition-colors"
        >
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">Admin</span>
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowDropdown(false)}
            />
            
            {/* Dropdown Content */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">Signed in as</p>
                <p className="text-sm text-gray-500">Administrator</p>
              </div>
              
              <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                {loading ? 'Signing out...' : 'Sign out'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}