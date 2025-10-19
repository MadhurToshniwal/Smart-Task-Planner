#!/bin/bash

echo "Installing backend dependencies..."
cd backend && npm install

echo "Installing frontend dependencies..."
cd ../frontend && npm install

echo "Building frontend..."
npm run build

echo "Copying frontend build to backend..."
cd ..
mkdir -p backend/public
cp -r frontend/build/* backend/public/

echo "Build completed successfully!"