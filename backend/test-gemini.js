const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function testGeminiAPI() {
  console.log('🔧 Testing Gemini API...');
  
  // Check if API key exists
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ Gemini API key not found in environment variables');
    return;
  }
  
  console.log('✅ Gemini API key found:', process.env.GEMINI_API_KEY.substring(0, 10) + '...');
  
  try {
    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Try the most basic model name
    console.log('🔍 Trying gemini-pro model...');
    let model;
    try {
      model = genAI.getGenerativeModel({ model: "gemini-pro" });
    } catch (error) {
      console.log('❌ gemini-pro failed, trying text-bison...');
      try {
        model = genAI.getGenerativeModel({ model: "text-bison" });
      } catch (error2) {
        console.log('❌ text-bison failed, trying models/gemini-pro...');
        model = genAI.getGenerativeModel({ model: "models/gemini-pro" });
      }
    }

    // Simple test prompt
    const prompt = "Generate a simple JSON array with 2 tasks for 'Launch a mobile app'. Use this format: [{'title': 'Task 1', 'description': 'Description'}]";
    
    console.log('📝 Sending test prompt to Gemini...');
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Gemini API Response:');
    console.log(text);
    
    // Test JSON parsing
    const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s);
    if (jsonMatch) {
      console.log('🎯 JSON found, attempting to parse...');
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('✅ Successfully parsed JSON:', parsed);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError.message);
      }
    } else {
      console.log('⚠️ No JSON array found in response');
    }
    
  } catch (error) {
    console.error('❌ Gemini API Error:', error);
    
    // Check if it's an API key issue
    if (error.message.includes('API_KEY_INVALID') || error.message.includes('401')) {
      console.log('💡 This might be an API key issue. Please check:');
      console.log('1. Your API key is correct');
      console.log('2. The API key has proper permissions');
      console.log('3. You haven\'t exceeded the quota');
    }
  }
}

testGeminiAPI();