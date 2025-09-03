import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page with return url
    return <Navigate to="/pages/login" state={{ from: location }} replace />;
  }

  // Check if email is confirmed for new users
  if (user && !user.email_confirmed_at) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-xl shadow-lg border text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Verification Required</h2>
            <p className="text-gray-600 mb-6">
              Please check your email and click the verification link to access your account.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
            >
              I've Verified My Email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
