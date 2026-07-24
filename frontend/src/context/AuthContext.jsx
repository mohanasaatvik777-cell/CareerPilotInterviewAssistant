import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, profileAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('interview_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await authAPI.getMe();
          if (res.data.success) {
            setUser(res.data.user);
          } else {
            logout();
          }
        } catch (err) {
          console.error('Session validation failed:', err);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.data.success) {
      setToken(res.data.token);
      localStorage.setItem('interview_token', res.data.token);
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.data.error || 'Login failed');
  };

  const register = async (name, email, password, targetRole, experienceLevel, industry) => {
    const res = await authAPI.register({ name, email, password, targetRole, experienceLevel, industry });
    if (res.data.success) {
      setToken(res.data.token);
      localStorage.setItem('interview_token', res.data.token);
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.data.error || 'Registration failed');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('interview_token');
  };

  const updateProfile = async (updatedData) => {
    const res = await profileAPI.updateProfile(updatedData);
    if (res.data.success) {
      setUser(res.data.profile);
      return res.data.profile;
    }
    throw new Error(res.data.error || 'Failed to update profile');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
