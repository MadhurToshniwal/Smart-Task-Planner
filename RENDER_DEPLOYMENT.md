# 🚀 Deploy to Render.com (FREE & EASY)

## Why Render?
✅ **FREE tier available** - No credit card required  
✅ **Supports full-stack apps** - Node.js + MongoDB  
✅ **Auto-deploy from GitHub** - Push to deploy  
✅ **Built-in MongoDB** - Or use MongoDB Atlas free  
✅ **Simple setup** - Works first time  

---

## 🎯 Step-by-Step Deployment

### **Step 1: Sign Up for Render**
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account (free)
3. Authorize Render to access your repositories

### **Step 2: Create a Web Service**

1. Click **"New +"** → **"Web Service"**
2. Connect your **Smart-Task-Planner** repository
3. Use these settings:

```
Name: smart-task-planner
Region: Choose closest to you
Branch: railway-deployment
Root Directory: (leave empty)
Environment: Node
Build Command: npm install && cd backend && npm install && cd ../frontend && npm install && npm run build && cd .. && node copy-frontend.js
Start Command: cd backend && node server.js
```

4. Select **"Free"** plan
5. Click **"Create Web Service"**

### **Step 3: Add Environment Variables**

In the Render dashboard, go to **"Environment"** tab and add:

```
GROQ_API_KEY=your_actual_groq_api_key_here
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://your_mongodb_atlas_connection_string
```

### **Step 4: Set Up MongoDB (Choose One)**

#### **Option A: MongoDB Atlas (Recommended - FREE Forever)**

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free
3. Create a **FREE M0 cluster** (512MB storage)
4. Create a database user with username/password
5. Whitelist IP: `0.0.0.0/0` (allow all)
6. Get connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/smart-task-planner
   ```
7. Copy this to Render's `MONGO_URI` variable

#### **Option B: Render's Built-in PostgreSQL (if you want to switch from MongoDB)**
- Render offers free PostgreSQL
- Would require changing your database code

### **Step 5: Deploy**

1. After adding environment variables, Render will auto-deploy
2. Wait 3-5 minutes for build to complete
3. Your app will be live at: `https://smart-task-planner.onrender.com`

---

## 🎉 Success Indicators

✅ Build logs show: "Frontend build copied successfully!"  
✅ Deploy logs show: "Server running on port 10000"  
✅ Your app is accessible via the Render URL  

---

## 🔧 Troubleshooting

### Build Fails?
- Check build logs in Render dashboard
- Ensure `railway-deployment` branch is selected
- Verify all files are committed and pushed

### Can't Connect to Database?
- Check MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Verify connection string has correct username/password
- Test connection string locally first

### App Crashes on Start?
- Check environment variables are set correctly
- Ensure `GROQ_API_KEY` is your real API key
- Check deploy logs for errors

---

## 💰 Cost

- **Web Service**: FREE (sleeps after 15 min inactivity, wakes on request)
- **MongoDB Atlas**: FREE forever (512MB)
- **Total**: $0/month 🎉

---

## 🔄 Auto-Deploy

Every push to `railway-deployment` branch will trigger a new deployment automatically!

