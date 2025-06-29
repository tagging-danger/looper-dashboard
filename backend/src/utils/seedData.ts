import mongoose from 'mongoose';
import Transaction from '../models/Transaction';
import User from '../models/User';
import { generateToken } from '../middleware/auth';
import fs from 'fs';
import path from 'path';

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Check if data already exists
    const existingTransactions = await Transaction.countDocuments();
    if (existingTransactions > 0) {
      console.log('Database already contains data. Skipping seeding.');
      return;
    }

    // Read transaction data from JSON file
    const transactionsPath = path.join(__dirname, '../../../transactions.json');
    const transactionsData = JSON.parse(fs.readFileSync(transactionsPath, 'utf8'));

    // Transform data for MongoDB
    const transactions = transactionsData.map((transaction: any) => ({
      id: transaction.id,
      date: new Date(transaction.date),
      amount: transaction.amount,
      category: transaction.category,
      status: transaction.status,
      user_id: transaction.user_id,
      user_profile: transaction.user_profile
    }));

    // Insert transactions
    await Transaction.insertMany(transactions);
    console.log(`Inserted ${transactions.length} transactions`);

    // Create default admin user if it doesn't exist
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (!existingAdmin) {
      const adminUser = new User({
        username: 'admin',
        email: 'admin@financial.com',
        password: 'admin123',
        role: 'admin'
      });

      await adminUser.save();
      const token = generateToken(String(adminUser._id));
      
      console.log('Created admin user:');
      console.log('Email: admin@financial.com');
      console.log('Password: admin123');
      console.log('Token:', token);
    }

    // Create sample analyst user
    const existingAnalyst = await User.findOne({ email: 'analyst@financial.com' });
    if (!existingAnalyst) {
      const analystUser = new User({
        username: 'analyst',
        email: 'analyst@financial.com',
        password: 'analyst123',
        role: 'analyst'
      });

      await analystUser.save();
      console.log('Created analyst user: analyst@financial.com / analyst123');
    }

    // Create sample viewer user
    const existingViewer = await User.findOne({ email: 'viewer@financial.com' });
    if (!existingViewer) {
      const viewerUser = new User({
        username: 'viewer',
        email: 'viewer@financial.com',
        password: 'viewer123',
        role: 'viewer'
      });

      await viewerUser.save();
      console.log('Created viewer user: viewer@financial.com / viewer123');
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Database seeding error:', error);
    throw error;
  }
};

export default seedDatabase; 