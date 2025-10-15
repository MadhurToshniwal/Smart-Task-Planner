#!/bin/bash
# Railway Deployment Script

echo "🚂 Preparing Smart Task Planner for Railway deployment..."

# Install dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

echo "📦 Installing frontend dependencies..."
cd ../frontend  
npm install

echo "🏗️ Building React application..."
npm run build

echo "📁 Copying build files to backend..."
cd ..
cp -r frontend/build backend/public

echo "✅ Deployment preparation complete!"
echo ""
echo "🚀 Next steps:"
echo "1. Push your code to GitHub"
echo "2. Connect your GitHub repo to Railway"
echo "3. Set environment variables in Railway dashboard"
echo "4. Deploy automatically!"
echo ""
echo "📝 Required environment variables:"
echo "- MONGO_URI (MongoDB connection string)"
echo "- GROQ_API_KEY (Your Groq API key)"
echo "- NODE_ENV=production"