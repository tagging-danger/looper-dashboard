import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardOverview from '../components/DashboardOverview';
import TransactionsPage from './TransactionsPage';
import AnalyticsPage from './AnalyticsPage';
import ExportPage from './ExportPage';

const Dashboard: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardOverview />} />
      <Route path="/transactions" element={<TransactionsPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/export" element={<ExportPage />} />
    </Routes>
  );
};

export default Dashboard; 