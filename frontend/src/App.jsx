import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AIPracticePage from './pages/AIPracticePage';
import MockInterviewPage from './pages/MockInterviewPage';
import InterviewHistoryPage from './pages/InterviewHistoryPage';
import SessionDetailPage from './pages/SessionDetailPage';
import MentorDashboardPage from './pages/MentorDashboardPage';
import ProfilePage from './pages/ProfilePage';
import LoadingSpinner from './components/LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Authenticating session..." fullScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-500">
            <Navbar />
            <div className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/mentor/share/:code" element={<MentorDashboardPage />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/practice" element={<ProtectedRoute><AIPracticePage /></ProtectedRoute>} />
                <Route path="/mock/:id" element={<ProtectedRoute><MockInterviewPage /></ProtectedRoute>} />
                <Route path="/history" element={<ProtectedRoute><InterviewHistoryPage /></ProtectedRoute>} />
                <Route path="/sessions/:id" element={<ProtectedRoute><SessionDetailPage /></ProtectedRoute>} />
                <Route path="/mentor" element={<ProtectedRoute><MentorDashboardPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
