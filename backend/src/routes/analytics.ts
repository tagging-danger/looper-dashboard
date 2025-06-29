import { Router, Request, Response } from 'express';
import Transaction from '../models/Transaction';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get dashboard summary metrics
router.get('/summary', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter: any = {};
    if (startDate || endDate) {
      if (startDate) dateFilter.$gte = new Date(startDate as string);
      if (endDate) dateFilter.$lte = new Date(endDate as string);
    }

    // Get total revenue and expenses
    const revenueResult = await Transaction.aggregate([
      { $match: { category: 'Revenue', ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }) } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    const expenseResult = await Transaction.aggregate([
      { $match: { category: 'Expense', ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }) } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;
    const totalExpenses = expenseResult[0]?.total || 0;
    const revenueCount = revenueResult[0]?.count || 0;
    const expenseCount = expenseResult[0]?.count || 0;

    // Get status breakdown
    const statusBreakdown = await Transaction.aggregate([
      { $match: Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {} },
      { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$amount' } } }
    ]);

    // Get total transactions
    const totalTransactions = await Transaction.countDocuments(
      Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}
    );

    res.json({
      summary: {
        totalRevenue,
        totalExpenses,
        netIncome: totalRevenue - totalExpenses,
        revenueCount,
        expenseCount,
        totalTransactions
      },
      statusBreakdown: statusBreakdown.reduce((acc, item) => {
        acc[item._id] = { count: item.count, total: item.total };
        return acc;
      }, {} as any)
    });
  } catch (error) {
    console.error('Summary analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch summary analytics' });
  }
});

// Get revenue vs expenses trend (monthly)
router.get('/trends', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter: any = {};
    if (startDate || endDate) {
      if (startDate) dateFilter.$gte = new Date(startDate as string);
      if (endDate) dateFilter.$lte = new Date(endDate as string);
    }

    const trends = await Transaction.aggregate([
      { $match: Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {} },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            category: '$category'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: {
            year: '$_id.year',
            month: '$_id.month'
          },
          categories: {
            $push: {
              category: '$_id.category',
              total: '$total',
              count: '$count'
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const formattedTrends = trends.map(item => {
      const revenue = item.categories.find((c: any) => c.category === 'Revenue')?.total || 0;
      const expense = item.categories.find((c: any) => c.category === 'Expense')?.total || 0;
      
      return {
        period: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
        revenue,
        expense,
        netIncome: revenue - expense
      };
    });

    res.json({ trends: formattedTrends });
  } catch (error) {
    console.error('Trends analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch trends analytics' });
  }
});

// Get category breakdown
router.get('/categories', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter: any = {};
    if (startDate || endDate) {
      if (startDate) dateFilter.$gte = new Date(startDate as string);
      if (endDate) dateFilter.$lte = new Date(endDate as string);
    }

    const categoryBreakdown = await Transaction.aggregate([
      { $match: Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {} },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json({ categories: categoryBreakdown });
  } catch (error) {
    console.error('Category analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch category analytics' });
  }
});

// Get user performance analytics
router.get('/users', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter: any = {};
    if (startDate || endDate) {
      if (startDate) dateFilter.$gte = new Date(startDate as string);
      if (endDate) dateFilter.$lte = new Date(endDate as string);
    }

    const userPerformance = await Transaction.aggregate([
      { $match: Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {} },
      {
        $group: {
          _id: '$user_id',
          totalRevenue: {
            $sum: {
              $cond: [{ $eq: ['$category', 'Revenue'] }, '$amount', 0]
            }
          },
          totalExpenses: {
            $sum: {
              $cond: [{ $eq: ['$category', 'Expense'] }, '$amount', 0]
            }
          },
          transactionCount: { $sum: 1 },
          revenueCount: {
            $sum: { $cond: [{ $eq: ['$category', 'Revenue'] }, 1, 0] }
          },
          expenseCount: {
            $sum: { $cond: [{ $eq: ['$category', 'Expense'] }, 1, 0] }
          }
        }
      },
      {
        $addFields: {
          netIncome: { $subtract: ['$totalRevenue', '$totalExpenses'] },
          avgTransactionValue: { $divide: [{ $add: ['$totalRevenue', '$totalExpenses'] }, '$transactionCount'] }
        }
      },
      { $sort: { netIncome: -1 } }
    ]);

    res.json({ users: userPerformance });
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch user analytics' });
  }
});

// Get monthly performance comparison
router.get('/monthly-comparison', authenticateToken, async (req: Request, res: Response) => {
  try {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    const comparison = await Transaction.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(`${lastYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            category: '$category'
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $group: {
          _id: {
            year: '$_id.year',
            month: '$_id.month'
          },
          categories: {
            $push: {
              category: '$_id.category',
              total: '$total'
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const formattedComparison = comparison.map(item => {
      const revenue = item.categories.find((c: any) => c.category === 'Revenue')?.total || 0;
      const expense = item.categories.find((c: any) => c.category === 'Expense')?.total || 0;
      
      return {
        year: item._id.year,
        month: item._id.month,
        period: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
        revenue,
        expense,
        netIncome: revenue - expense
      };
    });

    res.json({ comparison: formattedComparison });
  } catch (error) {
    console.error('Monthly comparison error:', error);
    res.status(500).json({ error: 'Failed to fetch monthly comparison' });
  }
});

export default router; 