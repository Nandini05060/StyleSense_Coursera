import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('stylesense_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        localStorage.removeItem('stylesense_token');
        setUser(null);
      }
    } catch (err) {
      localStorage.removeItem('stylesense_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    try {
      const res = await api.login({ email, password });
      if (res.success) {
        localStorage.setItem('stylesense_token', res.token);
        setUser(res.user);
        showToast(`Welcome back, ${res.user.name}`);
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      showToast(err.message || 'Login failed.', 'error');
      return { success: false, message: err.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await api.register({ name, email, password });
      if (res.success) {
        localStorage.setItem('stylesense_token', res.token);
        setUser(res.user);
        showToast('Your StyleSense account has been created!');
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      showToast(err.message || 'Registration failed.', 'error');
      return { success: false, message: err.message };
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // Ignore network errors during logout
    } finally {
      localStorage.removeItem('stylesense_token');
      setUser(null);
      showToast('You have been signed out.');
    }
  };

  const updateUserPreferences = async (preferences) => {
    try {
      const res = await api.updatePreferences(preferences);
      if (res.success) {
        setUser(prev => prev ? { ...prev, preferences: res.data } : null);
        showToast('Style preferences saved.');
        return { success: true };
      }
    } catch (err) {
      showToast(err.message || 'Could not save preferences', 'error');
      return { success: false, message: err.message };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateUserPreferences,
    refreshUser: loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
