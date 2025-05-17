import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import StarryBackground from './components/StarryBackground';
import ChartPage from './pages/ChartPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ProfilePage from './pages/auth/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import ChartListPage from './pages/ChartListPage';
import ChartComparisonPage from './pages/ChartComparisonPage';
import SharedChartPage from './pages/SharedChartPage';
import TransitsPage from './pages/TransitsPage';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="app bg-night-900 text-white min-h-screen relative">
          <StarryBackground />
          <Navbar />
          
          <main className="pt-16 pb-20">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/shared-chart/:id" element={<SharedChartPage />} />
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/charts" element={<ChartListPage />} />
                <Route path="/charts/:id" element={<ChartPage />} />
                <Route path="/compare" element={<ChartComparisonPage />} />
                <Route path="/transits" element={<TransitsPage />} />
              </Route>
            </Routes>
          </main>
          
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
