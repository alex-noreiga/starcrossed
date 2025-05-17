import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { requestPasswordReset } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      
      await requestPasswordReset(email);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-md">
      <div className="bg-night-800 bg-opacity-90 p-8 rounded-xl shadow-xl">
        <h2 className="text-3xl font-bold text-primary-400 mb-6 text-center">Forgot Password</h2>
        
        {error && (
          <div className="bg-red-900 bg-opacity-50 text-red-200 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        {success ? (
          <div className="bg-green-900 bg-opacity-50 text-green-200 p-4 rounded-lg">
            <p>If your email is registered, you will receive a password reset link shortly.</p>
            <p className="mt-4">Check your email and follow the instructions to reset your password.</p>
            <div className="mt-4 text-center">
              <Link to="/login" className="text-primary-400 hover:text-primary-300">
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
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
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Reset Password'}
            </button>
          </form>
        )}
        
        {!success && (
          <div className="mt-6 text-center">
            <Link to="/login" className="text-primary-400 hover:text-primary-300">
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
