import React from 'react';
import { Navigate } from 'react-router-dom';
import { authAPI } from '../api/auth';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authAPI.isAuthenticated();
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;










