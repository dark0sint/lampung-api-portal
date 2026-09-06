import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ApiKeys from './pages/ApiKeys';
import DataExplorer from './pages/DataExplorer';
import Docs from './pages/Docs';
import Tickets from './pages/Tickets';
import Webhooks from './pages/Webhooks';
import AdminPanel from './pages/AdminPanel';

function Protected({ children, adminOnly }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Protected><Dashboard /></Protected>} />
      <Route path="/api-keys" element={<Protected><ApiKeys /></Protected>} />
      <Route path="/data" element={<Protected><DataExplorer /></Protected>} />
      <Route path="/dokumentasi" element={<Protected><Docs /></Protected>} />
      <Route path="/tiket" element={<Protected><Tickets /></Protected>} />
      <Route path="/webhook" element={<Protected><Webhooks /></Protected>} />
      <Route path="/admin" element={<Protected adminOnly><AdminPanel /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
