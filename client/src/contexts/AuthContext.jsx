import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Create auth context
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setCurrentUser(JSON.parse(user));
    }
    
    setLoading(false);
  }, []);

  // Register a new user
  const register = async (name, email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await axios.post('/api/auth/register', {
        name,
        email,
        password
      });
      
      const { token, user } = response.data;
      
      // Set auth headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setCurrentUser(user);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during registration');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });
      
      const { token, user } = response.data;
      
      // Set auth headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setCurrentUser(user);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setCurrentUser(null);
  };

  // Google login
  const googleLogin = async (token) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await axios.post('/api/auth/google', { token });
      
      const { token: jwtToken, user } = response.data;
      
      // Set auth headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
      
      // Save to localStorage
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      setCurrentUser(user);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Google login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Facebook login
  const facebookLogin = async (token) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await axios.post('/api/auth/facebook', { token });
      
      const { token: jwtToken, user } = response.data;
      
      // Set auth headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
      
      // Save to localStorage
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      setCurrentUser(user);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Facebook login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Request password reset
  const requestPasswordReset = async (email) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await axios.post('/api/auth/forgot-password', { email });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request password reset');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reset password with token
  const resetPassword = async (token, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await axios.post('/api/auth/reset-password', { 
        token, 
        password 
      });
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Verify email
  const verifyEmail = async (token) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await axios.get(`/api/auth/verify-email/${token}`);
      
      // Update user's verified status if they're logged in
      if (currentUser) {
        const updatedUser = { ...currentUser, emailVerified: true };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
      }
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify email');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await axios.put('/api/auth/profile', profileData);
      
      const { user } = response.data;
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(user));
      
      setCurrentUser(user);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await axios.put('/api/auth/change-password', {
        currentPassword,
        newPassword
      });
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get user profile
  const getUserProfile = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await axios.get('/api/auth/profile');
      
      const user = response.data;
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(user));
      
      setCurrentUser(user);
      return user;
    } catch (err) {
      if (err.response?.status === 401) {
        // Token expired or invalid
        logout();
      }
      
      setError(err.response?.data?.message || 'Failed to get user profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    googleLogin,
    facebookLogin,
    requestPasswordReset,
    resetPassword,
    verifyEmail,
    updateProfile,
    changePassword,
    getUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
