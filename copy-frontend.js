const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy frontend build to backend public directory
const frontendBuild = path.join(__dirname, 'frontend', 'build');
const backendPublic = path.join(__dirname, 'backend', 'public');

if (fs.existsSync(frontendBuild)) {
  console.log('Copying frontend build to backend/public...');
  copyDir(frontendBuild, backendPublic);
  console.log('Frontend build copied successfully!');
} else {
  console.log('Frontend build directory not found:', frontendBuild);
  process.exit(1);
}