import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('hanyshop_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data?.message || 'Invalid credentials' };
      }
      localStorage.setItem('hanyshop_token', data.token);
      localStorage.setItem('hanyshop_user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true, role: data.user.role, user: data.user };
    } catch (err) {
      return { success: false, message: 'Network error' };
    }
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hanyshop_user');
    localStorage.removeItem('hanyshop_token');
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};