import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

/**
 * ProtectedRoute: Checks if admin auth token exists in localStorage.
 * If not authenticated, redirects to /login keeping track of the intended location.
 */
export const ProtectedRoute = () => {
  const token = localStorage.getItem('aayup_admin_token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

/**
 * PublicRoute: Used for routes like /login.
 * If user is already authenticated with a valid token, redirects to dashboard /
 */
export const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('aayup_admin_token');

  if (token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

