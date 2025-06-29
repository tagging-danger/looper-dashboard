import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        <Route 
          path="/dashboard/*" 
          element={
            user ? (
              <Layout>
                <Dashboard />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/" 
          element={<Navigate to="/dashboard" replace />} 
        />
        <Route 
          path="*" 
          element={<Navigate to="/dashboard" replace />} 
        />
      </Routes>
    </Box>
  );
};

export default App; 