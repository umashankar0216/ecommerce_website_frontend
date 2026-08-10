import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../service/api/apiClient';
import { adminApi } from '../api/adminApi';

// ==========================================
// 🛒 CUSTOMER / USER AUTHENTICATION CONTEXT
// ==========================================
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user data:', e);
      }
    }

    setLoading(false);
  }, []);

  const register = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.register({
        name: userData.name,
        username: userData.username,
        email: userData.email,
        password: userData.password,
      });

      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      const usernameInput = credentials.userNameOrEmail || credentials.usernameOrEmail;

      const response = await authAPI.login({
        userNameOrEmail: usernameInput,
        password: credentials.password,
      });

      const newToken = response?.accessToken || response?.token;

      if (!newToken) {
        throw new Error('Invalid response from server: Token missing.');
      }

      const userObj = {
        username: usernameInput,
        email: usernameInput.includes('@') ? usernameInput : '',
      };

      localStorage.setItem('token', newToken);
      localStorage.setItem('username', usernameInput);
      localStorage.setItem('user', JSON.stringify(userObj));

      setToken(newToken);
      setUser(userObj);

      window.dispatchEvent(new Event('auth-change'));

      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('user');

    setToken(null);
    setUser(null);
    setError(null);

    window.dispatchEvent(new Event('auth-change'));
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        register,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// ==========================================
// 🛡️ ADMIN AUTHENTICATION CONTEXT
// ==========================================
export const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [adminToken, setAdminToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken');
    const storedUser = localStorage.getItem('adminUser');

    if (storedToken && storedUser) {
      setAdminToken(storedToken);
      try {
        setAdminUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored admin user data:', e);
      }
    }

    setLoading(false);
  }, []);

  // Listen for automatic token expiration / unauthorized responses
  useEffect(() => {
    const handleLogout = () => {
      logout();
    };
    window.addEventListener('admin-logout', handleLogout);
    return () => window.removeEventListener('admin-logout', handleLogout);
  }, []);

  const login = async (credentials) => {
    try {
      setError(null);
      const usernameInput = credentials.username || credentials.userNameOrEmail;

      const response = await adminApi.login({
        userNameOrEmail: usernameInput,
        password: credentials.password,
      });

      const newToken = response?.accessToken || response?.token;

      if (!newToken) {
        throw new Error('Invalid response from server: Token missing.');
      }

      const userObj = {
        username: usernameInput,
        email: usernameInput.includes('@') ? usernameInput : '',
      };

      localStorage.setItem('adminToken', newToken);
      localStorage.setItem('adminUser', JSON.stringify(userObj));

      setAdminToken(newToken);
      setAdminUser(userObj);

      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');

    setAdminToken(null);
    setAdminUser(null);
    setError(null);
  };

  const isAuthenticated = !!adminToken;

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        token: adminToken,
        loading,
        error,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};