import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Pagination,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Grid,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Search,
  FilterList,
  Sort,
  Edit,
  Delete,
  Visibility,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { transactionsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

interface Transaction {
  id: number;
  date: string;
  amount: number;
  category: string;
  status: string;
  user_id: number;
  user_profile: string;
}

const TransactionsPage: React.FC = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    user_id: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
  });
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [editForm, setEditForm] = useState({
    amount: '',
    category: '',
    status: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  // Fetch transactions
  const { data, isLoading, error, refetch } = useQuery(
    ['transactions', page, limit, sortBy, sortOrder, filters],
    () => transactionsAPI.getTransactions({
      page,
      limit,
      sortBy,
      sortOrder,
      ...filters,
    }),
    { keepPreviousData: true }
  );

  // Fetch filter values
  const { data: filterValues } = useQuery(
    'filterValues',
    transactionsAPI.getFilterValues,
    { staleTime: 5 * 60 * 1000 } // 5 minutes
  );

  // Check user permissions
  const canEdit = user?.role === 'admin' || user?.role === 'analyst';
  const canDelete = user?.role === 'admin';

  const handleView = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setViewDialogOpen(true);
  };

  const handleEdit = (transaction: Transaction) => {
    if (!canEdit) {
      setSnackbar({
        open: true,
        message: 'You do not have permission to edit transactions',
        severity: 'error',
      });
      return;
    }
    
    setSelectedTransaction(transaction);
    setEditForm({
      amount: transaction.amount.toString(),
      category: transaction.category,
      status: transaction.status,
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (transaction: Transaction) => {
    if (!canDelete) {
      setSnackbar({
        open: true,
        message: 'You do not have permission to delete transactions',
        severity: 'error',
      });
      return;
    }
    
    setSelectedTransaction(transaction);
    setDeleteDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!selectedTransaction) return;
    
    // Validate form data
    if (!editForm.amount || parseFloat(editForm.amount) <= 0) {
      setSnackbar({
        open: true,
        message: 'Please enter a valid amount',
        severity: 'error',
      });
      return;
    }
    
    if (!editForm.category || !editForm.status) {
      setSnackbar({
        open: true,
        message: 'Please fill in all fields',
        severity: 'error',
      });
      return;
    }
    
    try {
      // Call the API to update the transaction
      await transactionsAPI.updateTransaction(selectedTransaction.id, {
        amount: parseFloat(editForm.amount),
        category: editForm.category,
        status: editForm.status,
      });
      
      setSnackbar({
        open: true,
        message: 'Transaction updated successfully!',
        severity: 'success',
      });
      setEditDialogOpen(false);
      refetch(); // Refresh the data
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to update transaction',
        severity: 'error',
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTransaction) return;
    
    try {
      // Call the API to delete the transaction
      await transactionsAPI.deleteTransaction(selectedTransaction.id);
      
      setSnackbar({
        open: true,
        message: 'Transaction deleted successfully!',
        severity: 'success',
      });
      setDeleteDialogOpen(false);
      refetch(); // Refresh the data
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to delete transaction',
        severity: 'error',
      });
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      status: '',
      user_id: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
    });
    setPage(1);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading transactions</div>;

  const transactions = data?.transactions || [];
  const pagination = data?.pagination;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Transactions
      </Typography>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search transactions..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  Filters
                </Button>
                <Button variant="outlined" onClick={clearFilters}>
                  Clear
                </Button>
              </Box>
            </Grid>
          </Grid>

          <Collapse in={showFilters}>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filters.category}
                    label="Category"
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {filterValues?.categories?.map((category: string) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    label="Status"
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    {filterValues?.statuses?.map((status: string) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Min Amount"
                  type="number"
                  value={filters.minAmount}
                  onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Max Amount"
                  type="number"
                  value={filters.maxAmount}
                  onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                />
              </Grid>
            </Grid>
          </Collapse>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Button
                  startIcon={<Sort />}
                  onClick={() => handleSort('id')}
                  sx={{ textTransform: 'none' }}
                >
                  ID
                </Button>
              </TableCell>
              <TableCell>
                <Button
                  startIcon={<Sort />}
                  onClick={() => handleSort('date')}
                  sx={{ textTransform: 'none' }}
                >
                  Date
                </Button>
              </TableCell>
              <TableCell>
                <Button
                  startIcon={<Sort />}
                  onClick={() => handleSort('amount')}
                  sx={{ textTransform: 'none' }}
                >
                  Amount
                </Button>
              </TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction: Transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.id}</TableCell>
                <TableCell>{format(new Date(transaction.date), 'MMM dd, yyyy')}</TableCell>
                <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Chip label={transaction.category} size="small" />
                </TableCell>
                <TableCell>
                  <Chip
                    label={transaction.status}
                    size="small"
                    color={transaction.status === 'completed' ? 'success' : 'warning'}
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ width: 24, height: 24 }}>
                      {transaction.user_profile}
                    </Avatar>
                    <Typography variant="body2">User {transaction.user_id}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={0.5}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handleView(transaction)}
                        color="primary"
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    {canEdit && (
                      <Tooltip title="Edit Transaction">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(transaction)}
                          color="primary"
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                    )}
                    {canDelete && (
                      <Tooltip title="Delete Transaction">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(transaction)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {pagination && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.currentPage}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
          />
        </Box>
      )}

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Transaction Details</DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">ID</Typography>
                <Typography variant="body1">{selectedTransaction.id}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                <Typography variant="body1">
                  {format(new Date(selectedTransaction.date), 'MMM dd, yyyy')}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">Amount</Typography>
                <Typography variant="body1">${selectedTransaction.amount.toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                <Typography variant="body1">{selectedTransaction.category}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Typography variant="body1">{selectedTransaction.status}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">User ID</Typography>
                <Typography variant="body1">{selectedTransaction.user_id}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">User Profile</Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar>{selectedTransaction.user_profile}</Avatar>
                  <Typography variant="body1">{selectedTransaction.user_profile}</Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Transaction</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={editForm.amount}
                onChange={(e) => setEditForm(prev => ({ ...prev, amount: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={editForm.category}
                  label="Category"
                  onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                >
                  {filterValues?.categories?.map((category: string) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editForm.status}
                  label="Status"
                  onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                >
                  {filterValues?.statuses?.map((status: string) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete transaction #{selectedTransaction?.id}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TransactionsPage; 