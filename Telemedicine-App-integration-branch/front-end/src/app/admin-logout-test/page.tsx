'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { clearToken } from '@/lib/auth';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';

export default function AdminLogoutTest() {
  const router = useRouter();
  const { user, logout: hookLogout } = useAuth();

  const manualLogout = () => {
    clearToken();
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
    router.push('/sign-in');
  };

  const emergencyLogout = () => {
    // Clear ALL possible authentication data
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear specific auth tokens
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      
      // Clear cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
    }
    
    console.log('🚨 EMERGENCY LOGOUT - All auth data cleared');
    window.location.href = '/auth/login';
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">🔧 Admin Logout Test Page</h1>
        
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="font-medium text-blue-800 mb-2">Current User Status:</h3>
          <pre className="text-sm whitespace-pre-wrap">
            {JSON.stringify({
              isAuthenticated: !!user,
              userEmail: user?.email || 'Not logged in',
              userRole: user?.role || 'N/A',
              hasToken: typeof window !== 'undefined' ? !!localStorage.getItem('teletabib_token') : 'Unknown'
            }, null, 2)}
          </pre>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Method 1: Hook Logout */}
          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="font-semibold mb-3">Method 1: useAuth Hook</h3>
            <p className="text-sm text-gray-600 mb-4">Uses the built-in logout function from useAuth hook</p>
            <Button 
              onClick={hookLogout}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              🔐 Hook Logout
            </Button>
          </div>

          {/* Method 2: Manual Logout */}
          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="font-semibold mb-3">Method 2: Manual Clear</h3>
            <p className="text-sm text-gray-600 mb-4">Manually clears tokens and redirects</p>
            <Button 
              onClick={manualLogout}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              🧹 Manual Logout
            </Button>
          </div>

          {/* Method 3: Emergency Logout */}
          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="font-semibold mb-3">Method 3: Emergency Clear</h3>
            <p className="text-sm text-gray-600 mb-4">Nuclear option - clears everything</p>
            <Button 
              onClick={emergencyLogout}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              🚨 EMERGENCY LOGOUT
            </Button>
          </div>

          {/* Method 4: Emergency Page */}
          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="font-semibold mb-3">Method 4: Emergency Page</h3>
            <p className="text-sm text-gray-600 mb-4">Dedicated emergency logout page</p>
            <Link href="/emergency-logout" className="block">
              <Button className="w-full bg-orange-600 hover:bg-orange-700">
                🚑 Emergency Page
              </Button>
            </Link>
          </div>

          {/* Method 5: Sign-in Redirect */}
          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="font-semibold mb-3">Method 5: Direct Redirect</h3>
            <p className="text-sm text-gray-600 mb-4">Just go to sign-in (might stay logged in)</p>
            <Link href="/sign-in" className="block">
              <Button className="w-full bg-gray-600 hover:bg-gray-700">
                ↗️ Go to Sign-in
              </Button>
            </Link>
          </div>

          {/* Method 6: Admin Dashboard */}
          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="font-semibold mb-3">Back to Admin Dashboard</h3>
            <p className="text-sm text-gray-600 mb-4">Return to doctor dashboard</p>
            <Link href="/doctor" className="block">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                🩺 Admin Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="font-medium text-yellow-800 mb-2">Testing Instructions:</h3>
          <ol className="text-sm text-yellow-700 space-y-1">
            <li>1. Try each logout method one by one</li>
            <li>2. Check if you get redirected to login page</li>
            <li>3. Try to access admin dashboard directly: /doctor</li>
            <li>4. Check browser console for any errors</li>
            <li>5. Verify localStorage is cleared (F12 → Application → Local Storage)</li>
          </ol>
        </div>
      </div>
    </div>
  );
}