import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    if (password.length < 8) {
      return setError('Password must be at least 8 characters long');
    }
    
    try {
      setError('');
      setLoading(true);
      
      await register(name, email, password);
      setSuccess(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/profile');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create an account');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-md">
      <div className="bg-night-800 bg-opacity-90 p-8 rounded-xl shadow-xl">
        <h2 className="text-3xl font-bold text-primary-400 mb-6 text-center">Register</h2>
        
        {error && (
          <div className="bg-red-900 bg-opacity-50 text-red-200 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-900 bg-opacity-50 text-green-200 p-3 rounded-lg mb-4">
            Registration successful! Please check your email to verify your account.
            <div className="mt-2 text-sm">Redirecting to your profile...</div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-night-300 mb-1">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-night-700 border border-night-600 text-white"
              required
            />
          </div>
          
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
            <p className="text-night-400 text-xs mt-1">Must be at least 8 characters long</p>
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-night-300 mb-1">Confirm Password</label>
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
            disabled={loading}
            className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-night-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
