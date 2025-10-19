// Quick MongoDB Connection Test
// Replace YOUR_CONNECTION_STRING with your actual connection string

const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://madhur:madhur@cluster0.9fwyjgi.mongodb.net/smart-task-planner?retryWrites=true&w=majority&appName=Cluster0';

async function testConnection() {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(MONGO_URI);
    
    console.log('✅ SUCCESS! Connected to MongoDB Atlas');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🌍 Host:', mongoose.connection.host);
    
    // Close connection
    await mongoose.connection.close();
    console.log('👋 Connection closed');
    
  } catch (error) {
    console.error('❌ ERROR: Could not connect to MongoDB');
    console.error('Error message:', error.message);
    console.error('\nCommon issues:');
    console.error('1. Check if password in connection string is correct');
    console.error('2. Ensure IP address 0.0.0.0/0 is whitelisted');
    console.error('3. Verify connection string format');
  }
}

testConnection();
