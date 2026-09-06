import React, { createContext, useContext, useState } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('lpg_user');
    return saved ? JSON.parse(saved) : null;
  });

  async function login(email, password) {
    const { data } = await client.post('/api/auth/login', { email, password });
    localStorage.setItem('lpg_token', data.token);
    localStorage.setItem('lpg_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  async function register(payload) {
    await client.post('/api/auth/register', payload);
  }

  function logout() {
    localStorage.removeItem('lpg_token');
    localStorage.removeItem('lpg_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
