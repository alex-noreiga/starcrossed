import React from 'react';
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm';
import StarryBackground from '../../components/StarryBackground';

const ForgotPasswordPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <StarryBackground />
      <ForgotPasswordForm />
    </div>
  );
};

export default ForgotPasswordPage;
