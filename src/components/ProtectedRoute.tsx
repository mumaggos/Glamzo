import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // 1. Show dynamic, high-fidelity spinner while authenticating
  if (loading) {
    return (
      <div id="loading-page" className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FC] gap-6">
        {/* Premium Glamzo spinner */}
        <div className="relative flex items-center justify-center">
          {/* Outer rotating ring */}
          <div className="absolute w-16 h-16 border-[3px] border-transparent border-t-purple-600 border-r-indigo-500 rounded-full animate-[spin_1.5s_linear_infinite]" />
          {/* Inner pulsing logo */}
          <div className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center animate-pulse z-10">
            <span className="text-xl font-black text-slate-900 tracking-tighter">G</span>
          </div>
        </div>
        <span className="text-xs tracking-widest font-bold font-sans text-slate-500 uppercase select-none animate-pulse">
          A preparar o seu espaço...
        </span>
      </div>
    );
  }

  // 2. Guest protection: Redirect unauthenticated requests to login page base on directory path
  if (!user) {
    const path = location.pathname;
    if (path.startsWith('/admin')) {
      return <Navigate to="/admin/login" replace />;
    }
    if (path.startsWith('/partner/dashboard') || path.startsWith('/partner') || (allowedRoles && allowedRoles.includes('business') && !allowedRoles.includes('customer'))) {
      return <Navigate to="/partner/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  // 3. Role authorization check
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = profile?.role || 'customer';
    
    // If user role is NOT in the list of allowed privileges
    if (!allowedRoles.includes(userRole)) {
      // Redirect to their respective primary home dashboards
      switch (userRole) {
        case 'admin':
          return <Navigate to="/admin" replace />;
        case 'business':
          return <Navigate to="/partner/setup" replace />;
        case 'customer':
        default:
          return <Navigate to="/account" replace />;
      }
    }
  }

  // 4. Authorized: Render request view
  return <>{children}</>;
}
