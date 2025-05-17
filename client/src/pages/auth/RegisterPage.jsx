import React from 'react';
import RegisterForm from '../../components/auth/RegisterForm';
import StarryBackground from '../../components/StarryBackground';

const RegisterPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <StarryBackground />
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;
