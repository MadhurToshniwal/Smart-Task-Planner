# Railway Deployment Guide for Smart Task Planner

## 🚂 Deploy on Railway (100% FREE)

### Step 1: Prepare Your Code
1. Push your code to GitHub repository
2. Make sure all files are committed

### Step 2: Railway Setup
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub account (free)
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your `smart-task-planner` repository

### Step 3: Configure Environment Variables
In Railway dashboard, add these environment variables:

```
NODE_ENV=production
PORT=5000
GROQ_API_KEY=your_groq_api_key_here
MONGO_URI=mongodb://localhost:27017/smart-task-planner
```

### Step 4: Add MongoDB Database
1. In Railway dashboard, click "New Service"
2. Select "Database" → "MongoDB"
3. Railway will provide a connection string
4. Update `MONGO_URI` environment variable with the new connection string

### Step 5: Deploy
1. Railway will automatically build and deploy
2. You'll get a free `yourapp.railway.app` URL
3. Your app will be live in minutes!

## 🎯 Alternative: Use MongoDB Atlas (Recommended)

For better reliability, use MongoDB Atlas (free tier):

1. Create account at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create free cluster (512MB - sufficient for development)
3. Get connection string
4. Update `MONGO_URI` in Railway environment variables

Example MongoDB Atlas URI:
```
mongodb+srv://username:password@cluster0.abcdef.mongodb.net/smart-task-planner?retryWrites=true&w=majority
```

## 🚀 Deploy Commands

If using Railway CLI:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway deploy
```

## 💰 Cost Breakdown
- **Railway**: $5/month credit (FREE)
- **MongoDB Atlas**: Free tier (512MB)
- **Groq API**: Free tier
- **Total Monthly Cost**: $0 🎉

## 🔧 Production Optimizations

The deployment includes:
- ✅ Environment-based configuration
- ✅ Production MongoDB connection
- ✅ Automatic builds
- ✅ HTTPS enabled by default
- ✅ Custom domain support
- ✅ Auto-scaling

## 📝 Post-Deployment Steps

1. **Test the deployment**: Visit your Railway URL
2. **Update CORS**: If needed, update allowed origins in backend
3. **Custom domain**: Add your custom domain in Railway settings
4. **Monitoring**: Set up Railway's built-in monitoring

## 🎯 Your App Will Be Live At:
```
https://yourappname.railway.app
```

## 🏆 Why Railway for Your Project?
- ✅ **Zero configuration** deployment
- ✅ **Free tier** perfect for demos
- ✅ **Automatic HTTPS**
- ✅ **Built-in monitoring**
- ✅ **Easy database setup**
- ✅ **GitHub integration**
- ✅ **Perfect for hackathons/demos**

Your Smart Task Planner will be production-ready and accessible worldwide! 🌍