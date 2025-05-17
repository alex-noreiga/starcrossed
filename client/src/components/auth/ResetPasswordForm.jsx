import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ResetPasswordForm = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Extract token from URL query parameter
    const queryParams = new URLSearchParams(location.search);
    const tokenParam = queryParams.get('token');
    
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('Reset token is missing');
    }
  }, [location]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    if (password.length < 8) {
      return setError('Password must be at least 8 characters long');
    }
    
    if (!token) {
      return setError('Reset token is missing');
    }
    
    try {
      setError('');
      setLoading(true);
      
      await resetPassword(token, password);
      setSuccess(true);
      
      // Redirect to login after a delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-md">
      <div className="bg-night-800 bg-opacity-90 p-8 rounded-xl shadow-xl">
        <h2 className="text-3xl font-bold text-primary-400 mb-6 text-center">Reset Password</h2>
        
        {error && (
          <div className="bg-red-900 bg-opacity-50 text-red-200 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        {success ? (
          <div className="bg-green-900 bg-opacity-50 text-green-200 p-4 rounded-lg">
            <p>Your password has been reset successfully!</p>
            <p className="mt-2">You can now log in with your new password.</p>
            <div className="mt-4 text-center">
              <p className="text-sm text-green-200 mb-2">Redirecting to login page...</p>
              <Link to="/login" className="text-primary-400 hover:text-primary-300">
                Go to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-night-300 mb-1">New Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-night-700 border border-night-600 text-white"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !token}
              className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordForm;
