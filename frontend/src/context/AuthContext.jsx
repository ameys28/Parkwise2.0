import { createContext, useEffect, useMemo, useState } from 'react';
import { apiClient, setAuthToken } from '../services/api';

export const AuthContext = createContext();

const STORAGE_KEY = 'parkwise.auth';

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null,
  });

  useEffect(() => {
    const storedAuth = window.localStorage.getItem(STORAGE_KEY);
    if (!storedAuth) {
      return;
    }

    try {
      const parsed = JSON.parse(storedAuth);
      if (parsed?.token && parsed?.user) {
        setAuthToken(parsed.token);
        setAuth({ isAuthenticated: true, user: parsed.user });
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const { data } = await apiClient.post('/auth/login', { username, password });
      setAuthToken(data.token);

      const user = {
        id: data.user.id,
        username: data.user.username,
        role: data.user.role,
      };

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: data.token, user }));
      setAuth({ isAuthenticated: true, user });
      return { success: true, role: data.user.role };
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      return { success: false, error: message };
    }
  };

  const register = async ({ username, password, role = 'USER' }) => {
    try {
      const { data } = await apiClient.post('/auth/register', { username, password, role });
      setAuthToken(data.token);

      const user = {
        id: data.user.id,
        username: data.user.username,
        role: data.user.role,
      };

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: data.token, user }));
      setAuth({ isAuthenticated: true, user });
      return { success: true, role: data.user.role };
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    setAuthToken(null);
    window.localStorage.removeItem(STORAGE_KEY);
    setAuth({ isAuthenticated: false, user: null });
  };

  const value = useMemo(() => ({ auth, login, logout, register }), [auth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
