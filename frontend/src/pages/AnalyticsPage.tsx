import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useQuery } from 'react-query';
import { analyticsAPI } from '../services/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

const AnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    startDate: null as Date | null,
    endDate: null as Date | null,
  });

  const { data: summaryData, isLoading: summaryLoading } = useQuery(
    ['analytics-summary', dateRange],
    () => analyticsAPI.getSummary({
      startDate: dateRange.startDate?.toISOString(),
      endDate: dateRange.endDate?.toISOString(),
    })
  );

  const { data: trendsData, isLoading: trendsLoading } = useQuery(
    ['analytics-trends', dateRange],
    () => analyticsAPI.getTrends({
      startDate: dateRange.startDate?.toISOString(),
      endDate: dateRange.endDate?.toISOString(),
    })
  );

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery(
    ['analytics-categories', dateRange],
    () => analyticsAPI.getCategories({
      startDate: dateRange.startDate?.toISOString(),
      endDate: dateRange.endDate?.toISOString(),
    })
  );

  const { data: usersData, isLoading: usersLoading } = useQuery(
    ['analytics-users', dateRange],
    () => analyticsAPI.getUsers({
      startDate: dateRange.startDate?.toISOString(),
      endDate: dateRange.endDate?.toISOString(),
    })
  );

  const { data: comparisonData, isLoading: comparisonLoading } = useQuery(
    'analytics-comparison',
    () => analyticsAPI.getMonthlyComparison()
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (summaryLoading || trendsLoading || categoriesLoading || usersLoading || comparisonLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const summary = summaryData?.summary || {};
  const trends = trendsData?.trends || [];
  const categories = categoriesData?.categories || [];
  const users = usersData?.users || [];
  const comparison = comparisonData?.comparison || [];

  const pieData = categories.map((cat: any) => ({
    name: cat._id,
    value: cat.total,
  }));

  const userChartData = users.slice(0, 10).map((user: any) => ({
    name: user._id,
    revenue: user.totalRevenue,
    expenses: user.totalExpenses,
    netIncome: user.netIncome,
  }));

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Analytics
        </Typography>

        {/* Date Range Filter */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <DatePicker
                  label="Start Date"
                  value={dateRange.startDate}
                  onChange={(date) => setDateRange(prev => ({ ...prev, startDate: date }))}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <DatePicker
                  label="End Date"
                  value={dateRange.endDate}
                  onChange={(date) => setDateRange(prev => ({ ...prev, endDate: date }))}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setDateRange({ startDate: null, endDate: null })}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Summary Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Revenue
                </Typography>
                <Typography variant="h4" color="success.main">
                  {formatCurrency(summary.totalRevenue || 0)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {summary.revenueCount || 0} transactions
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Expenses
                </Typography>
                <Typography variant="h4" color="error.main">
                  {formatCurrency(summary.totalExpenses || 0)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {summary.expenseCount || 0} transactions
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Net Income
                </Typography>
                <Typography 
                  variant="h4" 
                  color={summary.netIncome >= 0 ? 'success.main' : 'error.main'}
                >
                  {formatCurrency(summary.netIncome || 0)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Profit/Loss
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Transactions
                </Typography>
                <Typography variant="h4">
                  {summary.totalTransactions || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  All time
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3}>
          {/* Revenue vs Expenses Trend */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Revenue vs Expenses Trend
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any) => formatCurrency(value)}
                      labelFormatter={(label) => `Period: ${label}`}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stackId="1"
                      stroke="#8884d8" 
                      fill="#8884d8"
                      name="Revenue"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="expense" 
                      stackId="1"
                      stroke="#82ca9d" 
                      fill="#82ca9d"
                      name="Expenses"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Category Distribution */}
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

          {/* User Performance */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top 10 Users by Net Income
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={userChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                    <Bar dataKey="expenses" fill="#82ca9d" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Monthly Comparison */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Monthly Performance Comparison
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={comparison}>
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
                    <Line 
                      type="monotone" 
                      dataKey="netIncome" 
                      stroke="#ffc658" 
                      name="Net Income"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default AnalyticsPage; 