import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Receipt,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { analyticsAPI } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const DashboardOverview: React.FC = () => {
  const { data: summaryData, isLoading: summaryLoading } = useQuery(
    'dashboard-summary',
    () => analyticsAPI.getSummary()
  );

  const { data: trendsData, isLoading: trendsLoading } = useQuery(
    'dashboard-trends',
    () => analyticsAPI.getTrends()
  );

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery(
    'dashboard-categories',
    () => analyticsAPI.getCategories()
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (summaryLoading || trendsLoading || categoriesLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const summary = summaryData?.summary || {};
  const trends = trendsData?.trends || [];
  const categories = categoriesData?.categories || [];

  const pieData = categories.map((cat: any) => ({
    name: cat._id,
    value: cat.total,
  }));

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(summary.totalRevenue || 0)}
                  </Typography>
                </Box>
                <TrendingUp color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Expenses
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(summary.totalExpenses || 0)}
                  </Typography>
                </Box>
                <TrendingDown color="error" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Net Income
                  </Typography>
                  <Typography 
                    variant="h4" 
                    color={summary.netIncome >= 0 ? 'success.main' : 'error.main'}
                  >
                    {formatCurrency(summary.netIncome || 0)}
                  </Typography>
                </Box>
                <AccountBalance color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Transactions
                  </Typography>
                  <Typography variant="h4">
                    {summary.totalTransactions || 0}
                  </Typography>
                </Box>
                <Receipt color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Status Breakdown */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Transaction Status
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {Object.entries(summary.statusBreakdown || {}).map(([status, data]: [string, any]) => (
                  <Chip
                    key={status}
                    label={`${status}: ${data.count} (${formatCurrency(data.total)})`}
                    color={status === 'Paid' ? 'success' : 'warning'}
                    variant="outlined"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Category Breakdown
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {categories.map((cat: any) => (
                  <Chip
                    key={cat._id}
                    label={`${cat._id}: ${formatCurrency(cat.total)}`}
                    color={cat._id === 'Revenue' ? 'success' : 'error'}
                    variant="outlined"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue vs Expenses Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => formatCurrency(value)}
                    labelFormatter={(label) => `Period: ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8884d8" 
                    name="Revenue"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expense" 
                    stroke="#82ca9d" 
                    name="Expenses"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Category Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardOverview; 