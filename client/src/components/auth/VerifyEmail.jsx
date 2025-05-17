import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const VerifyEmail = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  
  const { verifyEmail } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    const verifyEmailToken = async () => {
      try {
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');
        
        if (!token) {
          setError('Verification token is missing');
          setLoading(false);
          return;
        }
        
        await verifyEmail(token);
        setVerified(true);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to verify email');
      } finally {
        setLoading(false);
      }
    };
    
    verifyEmailToken();
  }, [location, verifyEmail]);
  
  return (
    <div className="w-full max-w-md">
      <div className="bg-night-800 bg-opacity-90 p-8 rounded-xl shadow-xl">
        <h2 className="text-3xl font-bold text-primary-400 mb-6 text-center">Email Verification</h2>
        
        {loading && (
          <div className="flex flex-col items-center justify-center p-4">
            <div className="cosmic-spinner mb-4"></div>
            <p className="text-night-300">Verifying your email...</p>
          </div>
        )}
        
        {error && !loading && (
          <div className="bg-red-900 bg-opacity-50 text-red-200 p-4 rounded-lg">
            <p>{error}</p>
            <div className="mt-4 text-center">
              <Link to="/login" className="text-primary-400 hover:text-primary-300">
                Return to Login
              </Link>
            </div>
          </div>
        )}
        
        {verified && !loading && (
          <div className="bg-green-900 bg-opacity-50 text-green-200 p-4 rounded-lg">
            <p className="text-xl font-medium mb-2">Email Verified Successfully!</p>
            <p>Your email has been verified. You can now access all features of Starcrossed.</p>
            <div className="mt-4 flex flex-col items-center space-y-2">
              <Link 
                to="/profile" 
                className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors text-center"
              >
                Go to Profile
              </Link>
              <Link 
                to="/" 
                className="text-primary-400 hover:text-primary-300"
              >
                Return to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
