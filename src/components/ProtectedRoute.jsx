import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {

  const userData = sessionStorage.getItem('UserData');
  
  if (!userData) {

    return <Navigate to="/" replace />;
  }

  try {
    const parsedUserData = JSON.parse(userData);

    if (!parsedUserData?.access_token) {

      sessionStorage.removeItem('UserData');
      return <Navigate to="/" replace />;
    }

    if (!parsedUserData?.isOTPVerified) {

      sessionStorage.removeItem('UserData');
      return <Navigate to="/" replace />;
    }

    return children;
  } catch (error) {

    console.error('Error parsing UserData:', error);
    sessionStorage.removeItem('UserData');
    return <Navigate to="/" replace />;
  }
};

export default ProtectedRoute;

