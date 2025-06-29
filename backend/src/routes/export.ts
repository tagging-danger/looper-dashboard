import { Router, Request, Response } from 'express';
// import * as csvWriter from 'csv-writer'; // Not used, so remove this line
import Transaction from '../models/Transaction';
import { authenticateToken, canExportData } from '../middleware/auth';
import { Parser } from 'json2csv';

const router = Router();

// Available columns for export
const availableColumns = [
  { id: 'id', header: 'ID' },
  { id: 'date', header: 'Date' },
  { id: 'amount', header: 'Amount' },
  { id: 'category', header: 'Category' },
  { id: 'status', header: 'Status' },
  { id: 'user_id', header: 'User ID' },
  { id: 'user_profile', header: 'User Profile' },
  { id: 'createdAt', header: 'Created At' },
  { id: 'updatedAt', header: 'Updated At' }
];

// Get available columns for export configuration (only admin and analyst can access)
router.get('/columns', authenticateToken, canExportData, async (req: Request, res: Response) => {
  try {
    const columns = [
      { field: 'id', headerName: 'ID', type: 'number' },
      { field: 'date', headerName: 'Date', type: 'date' },
      { field: 'amount', headerName: 'Amount', type: 'number' },
      { field: 'category', headerName: 'Category', type: 'string' },
      { field: 'status', headerName: 'Status', type: 'string' },
      { field: 'user_id', headerName: 'User ID', type: 'number' },
      { field: 'user_profile', headerName: 'User Profile', type: 'string' }
    ];

    res.json({ columns });
  } catch (error) {
    console.error('Error fetching export columns:', error);
    res.status(500).json({ error: 'Failed to fetch export columns' });
  }
});

// Export transactions to CSV (only admin and analyst can export)
router.post('/csv', authenticateToken, canExportData, async (req: Request, res: Response) => {
  try {
    const { selectedColumns, filters = {} } = req.body;

    // Build filter object
    const filter: any = {};
    
    if (filters.category) filter.category = filters.category;
    if (filters.status) filter.status = filters.status;
    if (filters.user_id) filter.user_id = parseInt(filters.user_id);
    
    if (filters.startDate || filters.endDate) {
      filter.date = {};
      if (filters.startDate) filter.date.$gte = new Date(filters.startDate);
      if (filters.endDate) filter.date.$lte = new Date(filters.endDate);
    }
    
    if (filters.minAmount || filters.maxAmount) {
      filter.amount = {};
      if (filters.minAmount) filter.amount.$gte = parseFloat(filters.minAmount);
      if (filters.maxAmount) filter.amount.$lte = parseFloat(filters.maxAmount);
    }

    const transactions = await Transaction.find(filter).lean();

    // Transform data for CSV
    const csvData = transactions.map(transaction => {
      const row: any = {};
      selectedColumns.forEach((column: string) => {
        if (column === 'date') {
          row[column] = new Date(transaction.date).toLocaleDateString();
        } else if (column === 'amount') {
          row[column] = `$${transaction.amount.toFixed(2)}`;
        } else {
          row[column] = transaction[column as keyof typeof transaction];
        }
      });
      return row;
    });

    // Generate CSV
    const parser = new Parser({
      fields: selectedColumns.map((col: string) => ({
        label: col.charAt(0).toUpperCase() + col.slice(1),
        value: col
      }))
    });

    const csv = parser.parse(csvData);

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=transactions_${new Date().toISOString().split('T')[0]}.csv`);

    res.send(csv);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

// Export analytics data to CSV (only admin and analyst can export)
router.post('/analytics-csv', authenticateToken, canExportData, async (req: Request, res: Response) => {
  try {
    const { selectedColumns, filters = {} } = req.body;

    // Build filter object
    const filter: any = {};
    
    if (filters.category) filter.category = filters.category;
    if (filters.status) filter.status = filters.status;
    if (filters.user_id) filter.user_id = parseInt(filters.user_id);
    
    if (filters.startDate || filters.endDate) {
      filter.date = {};
      if (filters.startDate) filter.date.$gte = new Date(filters.startDate);
      if (filters.endDate) filter.date.$lte = new Date(filters.endDate);
    }

    const transactions = await Transaction.find(filter).lean();

    // Generate analytics data
    const analyticsData = [
      {
        totalTransactions: transactions.length,
        totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
        averageAmount: transactions.length > 0 ? transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length : 0,
        categories: [...new Set(transactions.map(t => t.category))].join(', '),
        statuses: [...new Set(transactions.map(t => t.status))].join(', '),
        dateRange: `${filters.startDate || 'N/A'} to ${filters.endDate || 'N/A'}`
      }
    ];

    // Generate CSV
    const parser = new Parser({
      fields: selectedColumns.map((col: string) => ({
        label: col.charAt(0).toUpperCase() + col.slice(1).replace(/([A-Z])/g, ' $1'),
        value: col
      }))
    });

    const csv = parser.parse(analyticsData);

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=analytics_${new Date().toISOString().split('T')[0]}.csv`);

    res.send(csv);
  } catch (error) {
    console.error('Error exporting analytics CSV:', error);
    res.status(500).json({ error: 'Failed to export analytics CSV' });
  }
});

// Helper function to generate CSV content
function generateCSV(headers: any[], data: any[]): string {
  const headerRow = headers.map(header => `"${header.title}"`).join(',');
  const dataRows = data.map(row => 
    headers.map(header => `"${row[header.id] || ''}"`).join(',')
  );
  
  return [headerRow, ...dataRows].join('\n');
}

export default router; 