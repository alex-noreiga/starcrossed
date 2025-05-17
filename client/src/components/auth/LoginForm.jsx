import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, googleLogin, facebookLogin } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      
      await login(email, password);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };
  
  // This function would be called when the Google sign-in button is clicked
  const handleGoogleLogin = async (googleUserToken) => {
    try {
      setError('');
      setLoading(true);
      
      await googleLogin(googleUserToken);
      navigate('/profile');
    } catch (err) {
      setError('Google login failed');
    } finally {
      setLoading(false);
    }
  };
  
  // This function would be called when the Facebook sign-in button is clicked
  const handleFacebookLogin = async (facebookUserToken) => {
    try {
      setError('');
      setLoading(true);
      
      await facebookLogin(facebookUserToken);
      navigate('/profile');
    } catch (err) {
      setError('Facebook login failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-md">
      <div className="bg-night-800 bg-opacity-90 p-8 rounded-xl shadow-xl">
        <h2 className="text-3xl font-bold text-primary-400 mb-6 text-center">Login</h2>
        
        {error && (
          <div className="bg-red-900 bg-opacity-50 text-red-200 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-night-300 mb-1">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-night-700 border border-night-600 text-white"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-night-300 mb-1">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-night-700 border border-night-600 text-white"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <Link to="/forgot-password" className="text-primary-400 hover:text-primary-300">
            Forgot password?
          </Link>
        </div>
        
        <div className="mt-4 flex items-center justify-center">
          <div className="border-t border-night-600 flex-grow mr-3"></div>
          <span className="text-night-400 text-sm">OR</span>
          <div className="border-t border-night-600 flex-grow ml-3"></div>
        </div>
        
        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={() => {
              // In a real app, you would integrate with Google Sign-In SDK
              // and call handleGoogleLogin with the token from Google
              alert('Google login would be implemented with SDK');
            }}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
          >
            <span className="mr-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" />
              </svg>
            </span>
            Continue with Google
          </button>
          
          <button
            type="button"
            onClick={() => {
              // In a real app, you would integrate with Facebook SDK
              // and call handleFacebookLogin with the token from Facebook
              alert('Facebook login would be implemented with SDK');
            }}
            className="w-full py-2 px-4 bg-blue-800 hover:bg-blue-900 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
          >
            <span className="mr-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 12a8 8 0 10-9.25 7.903v-5.59h-2.05V12h2.05v-1.85c0-2.04 1.21-3.15 3.04-3.15.88 0 1.8.15 1.8.15v1.99h-1.01c-1 0-1.31.62-1.31 1.26V12h2.24l-.36 2.313h-1.88v5.59A8.002 8.002 0 0020 12z" />
              </svg>
            </span>
            Continue with Facebook
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-night-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
