import React from 'react';
import LoginForm from '../../components/auth/LoginForm';
import StarryBackground from '../../components/StarryBackground';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <StarryBackground />
      <LoginForm />
    </div>
  );
};

export default LoginPage;
