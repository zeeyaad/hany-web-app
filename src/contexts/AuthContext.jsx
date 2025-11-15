import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

  const login = (username, password) => {
    const users = JSON.parse(localStorage.getItem('hanyshop_users') || '[]');
    const foundUser = users.find(u => u.username === username && u.password === password);
    
    if (foundUser) {
      const userSession = { username: foundUser.username, role: foundUser.role };
      setUser(userSession);
      localStorage.setItem('hanyshop_user', JSON.stringify(userSession));
      return { success: true, role: foundUser.role };
    }
    
    return { success: false, message: 'Invalid credentials' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hanyshop_user');
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};