# Deployment Guide for Render

## Backend Deployment on Render

### Prerequisites
1. MongoDB Atlas account (for cloud database)
2. Render account (free tier available)

### Step 1: Set up MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database)
2. Create a free account
3. Create a new cluster (free tier)
4. Create a database user with read/write permissions
5. Get your connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/database`)

### Step 2: Deploy to Render
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository: `tagging-danger/looper-dashboard`
4. Configure the service:
   - **Name**: `looper-dashboard-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free

### Step 3: Set Environment Variables
In your Render service dashboard, go to "Environment" tab and add:

```
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your-super-secret-jwt-key-here
PORT=10000
```

### Step 4: Deploy
1. Click "Create Web Service"
2. Render will automatically build and deploy your app
3. Your backend will be available at: `https://looper-dashboard-backend.onrender.com`

### Step 5: Update Frontend API URL
After deployment, update your frontend API calls to use the Render URL instead of localhost.

## Frontend Deployment on GitHub Pages

### Step 1: Install gh-pages
```bash
cd frontend
npm install gh-pages --save-dev
```

### Step 2: Update package.json
Add to frontend/package.json:
```json
{
  "homepage": "https://tagging-danger.github.io/looper-dashboard",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

### Step 3: Update API URL
Update all API calls in your frontend to use the Render backend URL.

### Step 4: Deploy
```bash
cd frontend
npm run deploy
```

## Environment Variables Reference

### Backend (.env)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=production
PORT=10000
```

### Frontend
Update API base URL to: `https://looper-dashboard-backend.onrender.com` 