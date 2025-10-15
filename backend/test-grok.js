const OpenAI = require('openai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function testGrokAPI() {
  console.log('🔧 Testing Grok API...');
  
  if (!process.env.GROK_API_KEY) {
    console.error('❌ Grok API key not found in environment variables');
    return;
  }
  
  console.log('✅ Grok API key found:', process.env.GROK_API_KEY.substring(0, 10) + '...');
  
  try {
    // Initialize Grok API client
    const grokClient = new OpenAI({
      apiKey: process.env.GROK_API_KEY,
      baseURL: "https://api.x.ai/v1"
    });

    // Simple test prompt
    const prompt = "Generate a simple JSON array with 2 tasks for 'Launch a mobile app'. Use this format: [{'title': 'Task 1', 'description': 'Description'}]";
    
    console.log('📝 Sending test prompt to Grok...');
    
    const response = await grokClient.chat.completions.create({
      model: "grok-beta",
      messages: [
        {
          role: "system", 
          content: "You are a helpful assistant. Always respond with valid JSON arrays only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });
    
    const text = response.choices[0].message.content;
    console.log('✅ Grok API Response:');
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
    console.error('❌ Grok API Error:', error);
    
    if (error.status === 401) {
      console.log('💡 This is an authentication error. Please check:');
      console.log('1. Your Grok API key is correct');
      console.log('2. The API key has proper permissions');
    }
  }
}

testGrokAPI();