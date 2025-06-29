# Railway Deployment Guide

## 🚀 Deploying to Railway

### Prerequisites
- Railway account (free tier available)
- MongoDB Atlas account (for database)
- GitHub repository connected

### Step 1: Set up MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database)
2. Create a free account
3. Create a new cluster (free tier)
4. Click "Connect" → "Connect your application"
5. Create a database user (remember username/password)
6. Copy the connection string (replace `<password>` with your actual password)

### Step 2: Deploy to Railway
1. Go to [Railway Dashboard](https://railway.app/)
2. Sign up/Login with your GitHub account
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your repository: `tagging-danger/looper-dashboard`
6. Railway will automatically detect it's a Node.js project

### Step 3: Configure Environment Variables
In your Railway project dashboard:

1. Go to **"Variables"** tab
2. Add these environment variables:

```
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_jwt_secret_key
PORT=10000
```

**Important:** Replace `your_mongodb_atlas_connection_string` with your actual MongoDB Atlas connection string.

### Step 4: Configure Build Settings
1. Go to **"Settings"** tab
2. Set **"Root Directory"** to: `backend`
3. Set **"Build Command"** to: `npm install && npm run build`
4. Set **"Start Command"** to: `npm start`

### Step 5: Deploy
1. Railway will automatically deploy when you push to GitHub
2. Or click **"Deploy"** button to deploy manually
3. Wait for the build to complete

### Step 6: Get Your Backend URL
1. Once deployed, go to **"Deployments"** tab
2. Click on your deployment
3. Copy the generated URL (e.g., `https://looper-dashboard-production.up.railway.app`)

### Step 7: Update Frontend API Configuration
Update your frontend API configuration to use the Railway backend URL:

1. Go to `frontend/src/services/api.ts`
2. Update the `API_BASE_URL` to your Railway backend URL
3. Deploy your frontend to GitHub Pages or another hosting service

### Step 8: Test Your Deployment
1. Visit your Railway backend URL + `/api/health` to check if it's working
2. Test the API endpoints
3. Check the logs in Railway dashboard for any errors

## 🔧 Troubleshooting

### Common Issues:
1. **Build fails**: Check the build logs in Railway dashboard
2. **Database connection fails**: Verify your MongoDB Atlas connection string
3. **CORS errors**: Make sure your frontend domain is in the CORS configuration
4. **Environment variables**: Ensure all required variables are set

### Railway CLI (Optional)
You can also use Railway CLI for easier deployment:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link your project
railway link

# Deploy
railway up
```

## 📊 Monitoring
- Check **"Deployments"** tab for deployment status
- Check **"Logs"** tab for application logs
- Check **"Metrics"** tab for performance data

## 🔄 Auto-Deploy
Railway automatically deploys when you push to your GitHub repository's main branch. 