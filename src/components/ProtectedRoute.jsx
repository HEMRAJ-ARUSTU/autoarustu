import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check if user is logged in
  const userData = localStorage.getItem('UserData');
  
  if (!userData) {
    // User not logged in, redirect to login
    return <Navigate to="/" replace />;
  }

  try {
    const parsedUserData = JSON.parse(userData);
    
    // Check if access_token exists
    if (!parsedUserData?.access_token) {
      // No valid token, redirect to login
      localStorage.removeItem('UserData');
      return <Navigate to="/" replace />;
    }

    // User is authenticated, render the protected component
    return children;
  } catch (error) {
    // Invalid UserData format, clear it and redirect
    console.error('Error parsing UserData:', error);
    localStorage.removeItem('UserData');
    return <Navigate to="/" replace />;
  }
};

export default ProtectedRoute;

