# Deployment Configuration

## Environment Variables Required

### For Backend (.env):
```
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/smart-task-planner
GROQ_API_KEY=your_groq_api_key
NODE_ENV=production
```

### For Vercel Environment Variables:
- `MONGO_URI` - MongoDB Atlas connection string
- `GROQ_API_KEY` - Your Groq API key
- `NODE_ENV` - production

## Deployment Steps

### 1. MongoDB Atlas Setup (Free)
1. Create account at https://cloud.mongodb.com
2. Create free cluster
3. Get connection string
4. Update MONGO_URI in environment variables

### 2. Frontend Deployment (Vercel)
```bash
# In frontend directory
npm run build
vercel --prod
```

### 3. Backend Deployment Options

#### Option A: Vercel (Full-Stack)
```bash
# Root directory
vercel --prod
```

#### Option B: Railway (Recommended for Backend)
```bash
# Connect GitHub repo
# Add MongoDB addon
# Deploy automatically
```

#### Option C: Render
```bash
# Connect GitHub repo
# Add environment variables
# Deploy
```

### 4. CORS Configuration
Update backend for production domains in server.js

## Recommended Architecture

### Free Deployment Strategy:
- **Frontend**: Vercel (Free)
- **Backend**: Railway/Render (Free tier)
- **Database**: MongoDB Atlas (Free tier - 512MB)

### Cost: $0/month for basic usage

## Production Checklist
- [ ] Replace local MongoDB with MongoDB Atlas
- [ ] Update CORS for production domains
- [ ] Set up environment variables securely
- [ ] Configure CI/CD pipeline
- [ ] Set up monitoring and logging
- [ ] Configure custom domain (optional)