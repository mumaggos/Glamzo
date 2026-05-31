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

  // 1. Show dynamic, high-fidelity spinner while authenticating or looking up profiles
  if (loading || (user && !profile)) {
    return (
      <div id="loading-page" className="min-h-screen flex flex-col items-center justify-center bg-[#07040E] gap-4">
        {/* Glamzo style delicate purple glowing activity spinner */}
        <div className="relative flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-purple-500/10 border-t-purple-500 rounded-full animate-spin" />
          <div className="absolute w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
        </div>
        <span className="text-[10px] tracking-widest font-bold font-mono text-purple-400 uppercase select-none">
          GLAMZO • VERIFICANDO CREDENCIAIS...
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
    if (path.startsWith('/dashboard') || path.startsWith('/partner') || (allowedRoles && allowedRoles.includes('business') && !allowedRoles.includes('customer'))) {
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
          return <Navigate to="/dashboard" replace />;
        case 'customer':
        default:
          return <Navigate to="/account" replace />;
      }
    }
  }

  // 4. Authorized: Render request view
  return <>{children}</>;
}
