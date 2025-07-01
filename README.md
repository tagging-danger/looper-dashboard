# Financial Analytics Dashboard

A full-stack financial analytics application with interactive visualizations, advanced filtering, and configurable CSV export functionality.

## Features

### 🔐 Authentication & Security
- JWT-based login/logout system
- Role-based access control (Admin, Analyst, Viewer)
- Secure API endpoints with token validation
- Password hashing with bcrypt

### 📊 Financial Dashboard
- **Interactive Visualizations**: Revenue vs expenses trends, category breakdowns, summary metrics
- **Transaction Table**: Paginated display with responsive design
- **Advanced Filtering**: Multi-field filters (Date, Amount, Category, Status, User)
- **Sorting**: Column-based sorting with visual indicators
- **Real-time Search**: Search across transaction fields

### 📈 Analytics
- Revenue vs Expenses trend analysis
- Category distribution charts
- User performance metrics
- Monthly comparison charts
- Date range filtering for analytics

### 📤 CSV Export System
- **Configurable Columns**: User selects which fields to export
- **Filtered Exports**: Apply filters before export
- **Analytics Export**: Export summary reports
- **Auto-download**: Automatic file download when ready

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Material-UI (MUI)** for UI components
- **Recharts** for data visualizations
- **React Query** for state management
- **React Router** for navigation
- **React Hook Form** for form handling
- **Date-fns** for date manipulation

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CSV generation** with custom implementation
- **Rate limiting** and security middleware

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/tagging-danger/looper-dashboard.git
   cd financial-analytics-dashboard
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/financial_analytics
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   NODE_ENV=development
   ```

4. **Start MongoDB**
   ```bash
   # Start MongoDB service
   mongod
   ```

5. **Run the application**
   ```bash
   # From the root directory
   npm run dev
   ```

   This will start both the backend (port 5000) and frontend (port 3000) servers.

## Usage

### Demo Accounts

The application comes with pre-configured demo accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@financial.com | admin123 |
| Analyst | analyst@financial.com | analyst123 |
| Viewer | viewer@financial.com | viewer123 |

### Features by Role

#### Admin
- Full access to all features
- Can create, edit, and delete transactions
- Can manage users and system settings

#### Analyst
- View and analyze all data
- Can create and edit transactions
- Access to all analytics and export features

#### Viewer
- Read-only access to data
- Can view analytics and export reports
- Cannot modify transactions

### Dashboard Overview

1. **Summary Cards**: Quick overview of total revenue, expenses, net income, and transaction count
2. **Status Breakdown**: Visual representation of paid vs pending transactions
3. **Category Distribution**: Pie chart showing revenue vs expense distribution
4. **Trend Charts**: Line charts showing revenue vs expenses over time

### Transactions Management

1. **Advanced Filtering**: Filter by category, status, user, date range, and amount range
2. **Search**: Real-time search across transaction fields
3. **Sorting**: Click column headers to sort data
4. **Pagination**: Navigate through large datasets
5. **Actions**: View, edit, and delete transactions (based on permissions)

### Analytics

1. **Date Range Filtering**: Select custom date ranges for analysis
2. **Multiple Chart Types**: Line charts, bar charts, pie charts, and area charts
3. **User Performance**: Top users by net income analysis
4. **Monthly Comparison**: Year-over-year performance comparison

### Export Functionality

1. **Transaction Export**:
   - Select specific columns to include
   - Apply filters before export
   - Custom filename
   - Automatic download

2. **Analytics Export**:
   - Export summary metrics
   - Include category and status breakdowns
   - Date range filtering

## API Documentation

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/setup-admin` - Setup admin user (development only)

### Transaction Endpoints

- `GET /api/transactions` - Get transactions with filtering and pagination
- `GET /api/transactions/:id` - Get specific transaction
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/filters/values` - Get filter values

### Analytics Endpoints

- `GET /api/analytics/summary` - Get dashboard summary
- `GET /api/analytics/trends` - Get revenue vs expenses trends
- `GET /api/analytics/categories` - Get category breakdown
- `GET /api/analytics/users` - Get user performance
- `GET /api/analytics/monthly-comparison` - Get monthly comparison

### Export Endpoints

- `GET /api/export/columns` - Get available columns for export
- `POST /api/export/csv` - Export transactions to CSV
- `POST /api/export/analytics-csv` - Export analytics to CSV

## Project Structure

```
financial-analytics-dashboard/
├── backend/
│   ├── src/
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Authentication middleware
│   │   ├── utils/           # Utility functions
│   │   └── index.ts         # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts
│   │   ├── services/        # API services
│   │   └── index.tsx        # App entry point
│   ├── public/
│   └── package.json
├── transactions.json        # Sample data
├── package.json
└── README.md
```

## Development

### Running in Development Mode

```bash
# Start both servers
npm run dev

# Start only backend
npm run server

# Start only frontend
npm run client
```

### Building for Production

```bash
# Build frontend
npm run build

# Start production server
npm start
```

### Database Seeding

The application automatically seeds the database with sample data on first run. To manually seed:

```bash
cd backend
npm run dev
```

The seeding process will:
1. Create demo users (admin, analyst, viewer)
2. Import transaction data from `transactions.json`
3. Set up database indexes for optimal performance

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Configured CORS for security
- **Helmet**: Security headers middleware
- **Input Validation**: Comprehensive input validation
- **Role-based Access**: Fine-grained permission control

## Performance Optimizations

- **Database Indexing**: Optimized MongoDB indexes for queries
- **Pagination**: Efficient data loading with pagination
- **Caching**: React Query for client-side caching
- **Lazy Loading**: Code splitting for better performance
- **Optimized Queries**: Efficient MongoDB aggregation pipelines

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the repository or contact the development team. 
