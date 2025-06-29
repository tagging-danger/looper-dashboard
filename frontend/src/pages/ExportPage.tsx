import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
  FormGroup,
  Chip,
  Divider,
} from '@mui/material';
import {
  Download,
  Settings,
  FileDownload,
  Analytics,
  CheckCircle,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { exportAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const ExportPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'id', 'date', 'amount', 'category', 'status'
  ]);
  const [exportFilters, setExportFilters] = useState({
    category: '',
    status: '',
    startDate: '',
    endDate: '',
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({ show: false, message: '', type: 'info' });

  // Check if user can export
  const canExport = user?.role === 'admin' || user?.role === 'analyst';

  // Fetch available columns
  const { data: columnsData, isLoading } = useQuery(
    'export-columns',
    exportAPI.getColumns,
    { enabled: canExport }
  );

  const handleColumnToggle = (column: string) => {
    setSelectedColumns(prev =>
      prev.includes(column)
        ? prev.filter(col => col !== column)
        : [...prev, column]
    );
  };

  const handleSelectAll = () => {
    if (columnsData?.columns) {
      setSelectedColumns(columnsData.columns.map((col: any) => col.field));
    }
  };

  const handleDeselectAll = () => {
    setSelectedColumns([]);
  };

  const handleExport = async () => {
    if (!canExport) {
      setExportStatus({
        show: true,
        message: 'You do not have permission to export data',
        type: 'error'
      });
      return;
    }

    if (selectedColumns.length === 0) {
      setExportStatus({
        show: true,
        message: 'Please select at least one column to export',
        type: 'error'
      });
      return;
    }

    setIsExporting(true);
    setExportStatus({
      show: true,
      message: 'Preparing export...',
      type: 'info'
    });

    try {
      const response = await exportAPI.exportCSV({
        selectedColumns,
        filters: exportFilters
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setExportStatus({
        show: true,
        message: 'Export completed successfully!',
        type: 'success'
      });
    } catch (error) {
      setExportStatus({
        show: true,
        message: 'Export failed. Please try again.',
        type: 'error'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleAnalyticsExport = async () => {
    if (!canExport) {
      setExportStatus({
        show: true,
        message: 'You do not have permission to export data',
        type: 'error'
      });
      return;
    }

    setIsExporting(true);
    setExportStatus({
      show: true,
      message: 'Preparing analytics export...',
      type: 'info'
    });

    try {
      const response = await exportAPI.exportAnalyticsCSV({
        selectedColumns: ['totalTransactions', 'totalAmount', 'averageAmount', 'categories', 'statuses'],
        filters: exportFilters
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setExportStatus({
        show: true,
        message: 'Analytics export completed successfully!',
        type: 'success'
      });
    } catch (error) {
      setExportStatus({
        show: true,
        message: 'Analytics export failed. Please try again.',
        type: 'error'
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (!canExport) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Export Data
        </Typography>
        <Alert severity="warning" sx={{ mt: 2 }}>
          You do not have permission to export data. Only administrators and analysts can export transaction data.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Export Data
      </Typography>

      {exportStatus.show && (
        <Alert
          severity={exportStatus.type}
          onClose={() => setExportStatus(prev => ({ ...prev, show: false }))}
          sx={{ mb: 3 }}
        >
          {exportStatus.message}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Column Selection */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Settings color="primary" />
                <Typography variant="h6">Column Selection</Typography>
              </Box>
              
              <Box display="flex" gap={1} mb={2}>
                <Button size="small" onClick={handleSelectAll}>
                  Select All
                </Button>
                <Button size="small" onClick={handleDeselectAll}>
                  Deselect All
                </Button>
              </Box>

              <FormControl component="fieldset" fullWidth>
                <FormGroup>
                  {columnsData?.columns?.map((column: any) => (
                    <FormControlLabel
                      key={column.field}
                      control={
                        <Checkbox
                          checked={selectedColumns.includes(column.field)}
                          onChange={() => handleColumnToggle(column.field)}
                        />
                      }
                      label={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography>{column.headerName}</Typography>
                          <Chip label={column.type} size="small" variant="outlined" />
                        </Box>
                      }
                    />
                  ))}
                </FormGroup>
              </FormControl>

              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body2" color="text.secondary">
                Selected: {selectedColumns.length} of {columnsData?.columns?.length || 0} columns
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Export Filters */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Settings color="primary" />
                <Typography variant="h6">Export Filters</Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Category Filter"
                    placeholder="e.g., Revenue, Expense"
                    value={exportFilters.category}
                    onChange={(e) => setExportFilters(prev => ({ ...prev, category: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Status Filter"
                    placeholder="e.g., completed, pending"
                    value={exportFilters.status}
                    onChange={(e) => setExportFilters(prev => ({ ...prev, status: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    value={exportFilters.startDate}
                    onChange={(e) => setExportFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    value={exportFilters.endDate}
                    onChange={(e) => setExportFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Export Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Export Actions
              </Typography>
              
              <Box display="flex" gap={2} flexWrap="wrap">
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={handleExport}
                  disabled={isExporting || selectedColumns.length === 0}
                  size="large"
                >
                  {isExporting ? 'Exporting...' : 'Export Transactions'}
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<CheckCircle />}
                  onClick={handleAnalyticsExport}
                  disabled={isExporting}
                  size="large"
                >
                  {isExporting ? 'Exporting...' : 'Export Analytics Summary'}
                </Button>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Export will include {selectedColumns.length} columns with applied filters.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ExportPage; 