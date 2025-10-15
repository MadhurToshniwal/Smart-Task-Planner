const axios = require('axios');

async function testAPI() {
  console.log('🧪 Testing Backend API...');
  
  try {
    const response = await axios.post('http://localhost:5000/api/tasks/generate', {
      goalText: 'Create a mobile game in 2 weeks',
      deadline: '2025-11-01T00:00:00.000Z'
    });
    
    console.log('✅ API Response:', response.status);
    console.log('🎯 Generated Goal:', response.data.goal?.title);
    console.log('📋 Number of tasks generated:', response.data.tasks?.length);
    
    if (response.data.tasks && response.data.tasks.length > 0) {
      console.log('📝 First few tasks:');
      response.data.tasks.slice(0, 3).forEach((task, index) => {
        console.log(`  ${index + 1}. ${task.title}`);
        console.log(`     ${task.description.substring(0, 80)}...`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ API Error:', error.response?.data || error.message);
    return false;
  }
}

testAPI();