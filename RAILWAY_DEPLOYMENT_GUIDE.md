# Railway Deployment Guide

## Complete Full-Stack Deployment Setup

This guide will help you deploy the Smart Task Planner on Railway with frontend, backend, and MongoDB database.

### Prerequisites
1. Railway account (railway.app)
2. Your actual Groq API key
3. GitHub repository access

### Step 1: Connect to Railway

1. Go to [railway.app](https://railway.app)
2. Sign in with your GitHub account
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `Smart-Task-Planner` repository
5. Choose the `railway-deployment` branch

### Step 2: Configure Services

Railway will automatically detect the `railway.toml` configuration and set up:

#### Backend Service
- **Name**: `smart-task-planner-backend`
- **Build Command**: `npm run railway-build`
- **Start Command**: `npm start`
- **Port**: 5000

#### Database Service
- **Type**: MongoDB
- **Provider**: Railway MongoDB Plugin

### Step 3: Set Environment Variables

In the Railway dashboard, go to your backend service and add these environment variables:

```
GROQ_API_KEY=your_actual_groq_api_key_here
MONGO_URI=mongodb://mongo:27017/smart-task-planner
NODE_ENV=production
PORT=5000
```

**Important**: Replace `your_actual_groq_api_key_here` with your real Groq API key.

### Step 4: Deploy

1. Railway will automatically start the deployment
2. The build process will:
   - Install backend dependencies
   - Install frontend dependencies
   - Build the React frontend
   - Copy frontend build to backend/public
   - Start the Node.js server

### Step 5: Access Your Application

Once deployed, Railway will provide a public URL like:
`https://smart-task-planner-backend-production.up.railway.app`

### Architecture Overview

```
[Frontend (React)] → [Backend (Node.js/Express)] → [MongoDB Database]
       ↓                        ↓                        ↓
   Static files           API endpoints              Task/Goal storage
   served from            with AI integration        
   backend/public         
```

### Features in Production

✅ **AI-Powered Task Generation**: Groq API integration working
✅ **Goal Management**: Create, view, and manage goals
✅ **Task Planning**: Intelligent task suggestions
✅ **Responsive UI**: Material-UI components
✅ **Database Persistence**: MongoDB for data storage
✅ **Static File Serving**: Optimized React build

### Environment Configuration

The app automatically detects the environment:
- **Development**: Uses `http://localhost:5000/api`
- **Production**: Uses relative URLs `/api`

### Troubleshooting

#### Build Issues
- Check that all dependencies are listed in package.json
- Verify Node.js version compatibility

#### Database Connection
- Ensure MongoDB service is running
- Check MONGO_URI environment variable

#### API Issues
- Verify GROQ_API_KEY is correctly set
- Check backend logs for API errors

### Security Notes

✅ All sensitive keys are in environment variables
✅ No API keys committed to repository
✅ .gitignore protects local environment files
✅ Production-ready configuration

### Support

If you encounter issues:
1. Check Railway logs in the dashboard
2. Verify environment variables are set
3. Check the GitHub repository for updates

---

**Deployed on Railway** 🚂