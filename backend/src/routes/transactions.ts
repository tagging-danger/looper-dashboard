import { Router, Request, Response } from 'express';
import Transaction from '../models/Transaction';
import { authenticateToken, canEditTransactions, canDeleteTransactions } from '../middleware/auth';

const router = Router();

// Get all transactions (all authenticated users can view)
router.get('/', authenticateToken, async (req: any, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      category = '',
      status = '',
      user_id = '',
      startDate = '',
      endDate = '',
      minAmount = '',
      maxAmount = '',
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { id: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { status: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (user_id) filter.user_id = parseInt(user_id as string);
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }
    
    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = parseFloat(minAmount as string);
      if (maxAmount) filter.amount.$lte = parseFloat(maxAmount as string);
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const transactions = await Transaction.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit as string));

    const total = await Transaction.countDocuments(filter);

    res.json({
      transactions,
      pagination: {
        currentPage: parseInt(page as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
        totalItems: total,
        itemsPerPage: parseInt(limit as string)
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get single transaction (all authenticated users can view)
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const transaction = await Transaction.findOne({ id: parseInt(req.params.id) });
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json({ transaction });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// Create transaction (only admin and analyst can create)
router.post('/', authenticateToken, canEditTransactions, async (req: Request, res: Response) => {
  try {
    const transaction = new Transaction(req.body);
    await transaction.save();
    res.status(201).json({ transaction });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Update transaction (only admin and analyst can update)
router.put('/:id', authenticateToken, canEditTransactions, async (req: Request, res: Response) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      req.body,
      { new: true }
    );
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json({ transaction });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// Delete transaction (only admin can delete)
router.delete('/:id', authenticateToken, canDeleteTransactions, async (req: Request, res: Response) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ id: parseInt(req.params.id) });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

// Get filter values (all authenticated users can view)
router.get('/filters/values', authenticateToken, async (req: Request, res: Response) => {
  try {
    const categories = await Transaction.distinct('category');
    const statuses = await Transaction.distinct('status');
    const userIds = await Transaction.distinct('user_id');

    res.json({
      categories,
      statuses,
      userIds: userIds.map(id => ({ id, label: `User ${id}` }))
    });
  } catch (error) {
    console.error('Error fetching filter values:', error);
    res.status(500).json({ error: 'Failed to fetch filter values' });
  }
});

export default router; 