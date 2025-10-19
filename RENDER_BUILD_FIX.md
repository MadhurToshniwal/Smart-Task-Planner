# 🚀 Render Build Command (Copy-Paste This)

## ✅ CORRECT Build Command for Render:

```bash
npm install && cd backend && npm install && cd ../frontend && npm ci --include=dev && npm run build && cd .. && node copy-frontend.js
```

## Key Change:
- Changed `npm install` to `npm ci --include=dev` for frontend
- This forces installation of devDependencies (like react-scripts) in production

## ✅ Start Command (No Change):

```bash
cd backend && node server.js
```

---

## 📋 Update in Render Dashboard:

1. Go to Settings → Build & Deploy
2. Update **Build Command** with the command above
3. Keep **Start Command** as: `cd backend && node server.js`
4. Save and redeploy

---

## Why This Fix Works:

Render runs with `NODE_ENV=production` which skips devDependencies by default.
Using `npm ci --include=dev` forces installation of ALL dependencies including dev ones.
