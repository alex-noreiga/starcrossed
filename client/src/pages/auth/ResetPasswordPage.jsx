import React from 'react';
import ResetPasswordForm from '../../components/auth/ResetPasswordForm';
import StarryBackground from '../../components/StarryBackground';

const ResetPasswordPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <StarryBackground />
      <ResetPasswordForm />
    </div>
  );
};

export default ResetPasswordPage;
