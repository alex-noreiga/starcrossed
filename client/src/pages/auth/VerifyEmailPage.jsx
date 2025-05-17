import React from 'react';
import VerifyEmail from '../../components/auth/VerifyEmail';
import StarryBackground from '../../components/StarryBackground';

const VerifyEmailPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <StarryBackground />
      <VerifyEmail />
    </div>
  );
};

export default VerifyEmailPage;
