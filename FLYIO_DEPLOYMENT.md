# 🚀 Deploy to Fly.io (FREE & POWERFUL)

## Why Fly.io?
✅ **FREE tier** - $5/month credit (enough for small apps)  
✅ **Real VMs** - Not serverless, always running  
✅ **Docker-based** - Full control  
✅ **Multiple regions** - Deploy globally  
✅ **Free PostgreSQL** - 3GB storage included  

---

## 🎯 Deployment Steps

### **Step 1: Install Fly CLI**

**Windows (PowerShell):**
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

**macOS/Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

### **Step 2: Sign Up & Login**

```bash
fly auth signup
# or
fly auth login
```

### **Step 3: Create Fly App**

```bash
cd d:\Unthinkable_new\smart-task-planner
fly launch
```

Follow prompts:
- **App name**: `smart-task-planner` (or let Fly generate)
- **Region**: Choose closest to you
- **PostgreSQL**: No (we'll use MongoDB Atlas)
- **Redis**: No
- **Deploy now**: No (we need to configure first)

### **Step 4: Set Environment Variables**

```bash
fly secrets set GROQ_API_KEY=your_actual_groq_api_key_here
fly secrets set MONGO_URI=mongodb+srv://your_atlas_connection_string
fly secrets set NODE_ENV=production
```

### **Step 5: Deploy**

```bash
fly deploy
```

Wait 2-3 minutes for deployment to complete.

### **Step 6: Open Your App**

```bash
fly open
```

Your app will open at: `https://smart-task-planner.fly.dev`

---

## 📝 Dockerfile Configuration

I'll create a `Dockerfile` for Fly.io:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm install
RUN cd backend && npm install
RUN cd frontend && npm install

# Copy source code
COPY . .

# Build frontend
RUN cd frontend && npm run build

# Copy frontend build to backend public
RUN mkdir -p backend/public
RUN cp -r frontend/build/* backend/public/

# Expose port
EXPOSE 8080

# Start backend server
CMD ["node", "backend/server.js"]
```

---

## 📋 Fly.io Configuration File

Create `fly.toml`:

```toml
app = "smart-task-planner"
primary_region = "sin"

[build]
  dockerfile = "Dockerfile"

[env]
  NODE_ENV = "production"
  PORT = "8080"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256
```

---

## 💾 MongoDB Setup (MongoDB Atlas)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create **FREE M0 cluster**
3. Create database user
4. Whitelist IP: `0.0.0.0/0`
5. Get connection string
6. Set as secret:
   ```bash
   fly secrets set MONGO_URI="your_connection_string"
   ```

---

## 🔄 Auto-Deploy from GitHub

Set up GitHub Actions for auto-deploy:

```bash
fly tokens create deploy -x 999999h
# Copy the token
```

Add token to GitHub repo secrets:
1. Go to GitHub repo → Settings → Secrets → Actions
2. Add new secret: `FLY_API_TOKEN`
3. Paste the token

Create `.github/workflows/fly.yml` (I'll create this for you)

---

## 💰 Cost

- **Free tier**: 3 shared-cpu-1x 256MB VMs
- **Enough for**: Small to medium traffic apps
- **Overage**: Only pay if you exceed free tier
- **Monthly credit**: $5 free credit

---

## 🔧 Useful Commands

```bash
# View logs
fly logs

# Check status
fly status

# Scale app
fly scale count 1

# SSH into VM
fly ssh console

# Restart app
fly apps restart smart-task-planner

# View metrics
fly dashboard
```

---

## 🎉 Advantages

- ✅ **Always running** (not serverless cold starts)
- ✅ **Full Linux VM** (install anything)
- ✅ **Global deployment** (multiple regions)
- ✅ **Auto-scaling** (scales down to 0 when idle)
- ✅ **Built-in metrics** (CPU, memory, network)

---

## 🔧 Troubleshooting

### Deployment Fails?
```bash
fly logs
```
Check for errors in build or runtime logs

### App Won't Start?
```bash
fly ssh console
node backend/server.js
```
Test manually in the VM

### Out of Memory?
```bash
fly scale memory 512
```
Increase memory allocation

