import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const UserProfile = () => {
  const { currentUser, updateProfile, changePassword, getUserProfile } = useAuth();
  
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    profileImage: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  useEffect(() => {
    // Load user data
    const loadUser = async () => {
      try {
        const user = await getUserProfile();
        
        setProfileData({
          name: user.name || '',
          bio: user.bio || '',
          profileImage: user.profileImage || ''
        });
      } catch (err) {
        setProfileError('Failed to load profile data');
      }
    };
    
    if (currentUser) {
      loadUser();
    }
  }, [currentUser, getUserProfile]);
  
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setProfileError('');
      setProfileSuccess('');
      setLoading(true);
      
      await updateProfile(profileData);
      setProfileSuccess('Profile updated successfully');
      
      // Clear success message after a delay
      setTimeout(() => {
        setProfileSuccess('');
      }, 3000);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    
    if (newPassword !== confirmPassword) {
      return setPasswordError('New passwords do not match');
    }
    
    if (newPassword.length < 8) {
      return setPasswordError('New password must be at least 8 characters long');
    }
    
    try {
      setPasswordError('');
      setPasswordSuccess('');
      setLoading(true);
      
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess('Password changed successfully');
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Clear success message after a delay
      setTimeout(() => {
        setPasswordSuccess('');
      }, 3000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };
  
  if (!currentUser) {
    return (
      <div className="bg-night-800 bg-opacity-90 p-8 rounded-xl shadow-xl text-center">
        <p className="text-night-300">Please log in to view your profile</p>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-4xl">
      <div className="bg-night-800 bg-opacity-90 p-8 rounded-xl shadow-xl">
        <h2 className="text-3xl font-bold text-primary-400 mb-6">Your Profile</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Profile Information */}
          <div>
            <h3 className="text-xl font-semibold text-night-200 mb-4">Edit Profile</h3>
            
            {profileError && (
              <div className="bg-red-900 bg-opacity-50 text-red-200 p-3 rounded-lg mb-4">
                {profileError}
              </div>
            )}
            
            {profileSuccess && (
              <div className="bg-green-900 bg-opacity-50 text-green-200 p-3 rounded-lg mb-4">
                {profileSuccess}
              </div>
            )}
            
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-night-300 mb-1">Name</label>
                <input
                  type="text"
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-night-700 border border-night-600 text-white"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="profileImage" className="block text-night-300 mb-1">Profile Image URL</label>
                <input
                  type="text"
                  id="profileImage"
                  value={profileData.profileImage}
                  onChange={(e) => setProfileData({ ...profileData, profileImage: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-night-700 border border-night-600 text-white"
                />
                <p className="text-night-400 text-xs mt-1">Leave empty for default avatar</p>
              </div>
              
              <div>
                <label htmlFor="bio" className="block text-night-300 mb-1">Bio</label>
                <textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-night-700 border border-night-600 text-white h-32"
                  placeholder="Tell us about yourself..."
                ></textarea>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
            
            <div className="mt-6">
              <div className="flex items-center">
                <div className="mr-3">
                  <span className="text-night-300">Email:</span>
                </div>
                <div className="text-white">{currentUser.email}</div>
                {currentUser.emailVerified ? (
                  <span className="ml-2 text-xs bg-green-800 text-green-200 px-2 py-1 rounded">Verified</span>
                ) : (
                  <span className="ml-2 text-xs bg-red-900 text-red-200 px-2 py-1 rounded">Not Verified</span>
                )}
              </div>
              
              {!currentUser.emailVerified && (
                <p className="text-yellow-400 text-sm mt-2">
                  Please check your email to verify your account.
                </p>
              )}
            </div>
          </div>
          
          {/* Change Password */}
          <div>
            <h3 className="text-xl font-semibold text-night-200 mb-4">Change Password</h3>
            
            {passwordError && (
              <div className="bg-red-900 bg-opacity-50 text-red-200 p-3 rounded-lg mb-4">
                {passwordError}
              </div>
            )}
            
            {passwordSuccess && (
              <div className="bg-green-900 bg-opacity-50 text-green-200 p-3 rounded-lg mb-4">
                {passwordSuccess}
              </div>
            )}
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-night-300 mb-1">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-night-700 border border-night-600 text-white"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-night-300 mb-1">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-night-700 border border-night-600 text-white"
                  required
                />
                <p className="text-night-400 text-xs mt-1">Must be at least 8 characters long</p>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-night-300 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-night-700 border border-night-600 text-white"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
            
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-night-200 mb-4">Connected Accounts</h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" />
                  </svg>
                  <span className="text-white">Google</span>
                  
                  {currentUser.socialLogins && currentUser.socialLogins.includes('google') ? (
                    <span className="ml-2 text-xs bg-green-800 text-green-200 px-2 py-1 rounded">Connected</span>
                  ) : (
                    <button
                      type="button"
                      className="ml-2 text-xs bg-blue-800 text-blue-200 px-2 py-1 rounded"
                      onClick={() => alert('Google connection would be implemented with SDK')}
                    >
                      Connect
                    </button>
                  )}
                </div>
                
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-700" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 12a8 8 0 10-9.25 7.903v-5.59h-2.05V12h2.05v-1.85c0-2.04 1.21-3.15 3.04-3.15.88 0 1.8.15 1.8.15v1.99h-1.01c-1 0-1.31.62-1.31 1.26V12h2.24l-.36 2.313h-1.88v5.59A8.002 8.002 0 0020 12z" />
                  </svg>
                  <span className="text-white">Facebook</span>
                  
                  {currentUser.socialLogins && currentUser.socialLogins.includes('facebook') ? (
                    <span className="ml-2 text-xs bg-green-800 text-green-200 px-2 py-1 rounded">Connected</span>
                  ) : (
                    <button
                      type="button"
                      className="ml-2 text-xs bg-blue-800 text-blue-200 px-2 py-1 rounded"
                      onClick={() => alert('Facebook connection would be implemented with SDK')}
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
