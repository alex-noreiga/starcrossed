import React from 'react';
import UserProfile from '../../components/auth/UserProfile';
import StarryBackground from '../../components/StarryBackground';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const ProfilePage = () => {
  const { currentUser, loading } = useAuth();
  
  // If still loading, show loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <StarryBackground />
        <div className="cosmic-spinner"></div>
      </div>
    );
  }
  
  // If not logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <StarryBackground />
      <UserProfile />
    </div>
  );
};

export default ProfilePage;
