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
    try {
      const res = await authAPI.login({ email, password });
      if (res.data.success) {
        setToken(res.data.token);
        localStorage.setItem('interview_token', res.data.token);
        setUser(res.data.user);
        return res.data;
      }
      throw new Error(res.data.error || 'Login failed');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.details?.[0]?.message || err.message || 'Login failed';
      throw new Error(msg);
    }
  };

  const register = async (name, email, password, targetRole, experienceLevel, industry) => {
    try {
      const res = await authAPI.register({ name, email, password, targetRole, experienceLevel, industry });
      if (res.data.success) {
        setToken(res.data.token);
        localStorage.setItem('interview_token', res.data.token);
        setUser(res.data.user);
        return res.data;
      }
      throw new Error(res.data.error || 'Registration failed');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.details?.[0]?.message || err.message || 'Registration failed';
      throw new Error(msg);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('interview_token');
  };

  const updateProfile = async (updatedData) => {
    try {
      const res = await profileAPI.updateProfile(updatedData);
      if (res.data.success) {
        setUser(res.data.profile);
        return res.data.profile;
      }
      throw new Error(res.data.error || 'Failed to update profile');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.details?.[0]?.message || err.message || 'Failed to update profile';
      throw new Error(msg);
    }
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
