import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  id: number;
  date: Date;
  amount: number;
  category: 'Revenue' | 'Expense';
  status: 'Paid' | 'Pending';
  user_id: string;
  user_profile: string;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['Revenue', 'Expense'],
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Paid', 'Pending'],
    index: true
  },
  user_id: {
    type: String,
    required: true,
    index: true
  },
  user_profile: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Compound indexes for better query performance
transactionSchema.index({ category: 1, status: 1 });
transactionSchema.index({ date: 1, category: 1 });
transactionSchema.index({ user_id: 1, date: 1 });

export default mongoose.model<ITransaction>('Transaction', transactionSchema); 