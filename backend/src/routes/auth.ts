import { Router, Request, Response } from 'express';
import User from '../models/User';
import { generateToken, authenticateToken } from '../middleware/auth';

const router = Router();

// Register new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password, role = 'viewer' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email or username already exists' 
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      role
    });

    await user.save();

    // Generate token
    const token = generateToken(String(user._id));

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(String(user._id));

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req: any, res: Response) => {
  try {
    const { username, email, role } = req.body;
    const userId = req.user._id;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already taken' });
      }
    }

    // Check if username is already taken by another user
    if (username) {
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, email, role },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/change-password', authenticateToken, async (req: any, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Get all users (admin only)
router.get('/users', authenticateToken, async (req: any, res: Response) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const users = await User.find({}).select('-password');
    res.json({ users });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get activity log (admin only)
router.get('/activity-log', authenticateToken, async (req: any, res: Response) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    // For now, return mock activity log
    // In a real application, you would have an Activity model and store actual activities
    const activityLog = [
      {
        id: 1,
        action: 'Login',
        timestamp: new Date().toISOString(),
        user: req.user.username,
        details: 'User logged in successfully'
      },
      {
        id: 2,
        action: 'Viewed Transactions',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        user: req.user.username,
        details: 'Accessed transactions page'
      },
      {
        id: 3,
        action: 'Exported CSV',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        user: req.user.username,
        details: 'Exported transaction data to CSV'
      },
      {
        id: 4,
        action: 'Updated Transaction',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        user: req.user.username,
        details: 'Updated transaction #15'
      }
    ];

    res.json({ activityLog });
  } catch (error) {
    console.error('Activity log fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch activity log' });
  }
});

// Create default admin user (for development)
router.post('/setup-admin', async (req: Request, res: Response) => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Admin user already exists' });
    }

    const adminUser = new User({
      username: 'admin',
      email: 'admin@financial.com',
      password: 'admin123',
      role: 'admin'
    });

    await adminUser.save();

    const token = generateToken(String(adminUser._id));

    res.status(201).json({
      message: 'Admin user created successfully',
      token,
      user: {
        id: adminUser._id,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role
      }
    });
  } catch (error) {
    console.error('Admin setup error:', error);
    res.status(500).json({ error: 'Admin setup failed' });
  }
});

export default router; 