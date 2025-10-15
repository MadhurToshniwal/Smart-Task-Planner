const OpenAI = require('openai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function testGroqAPI() {
  console.log('🔧 Testing Groq API...');
  
  if (!process.env.GROQ_API_KEY) {
    console.error('❌ Groq API key not found in environment variables');
    return;
  }
  
  console.log('✅ Groq API key found:', process.env.GROQ_API_KEY.substring(0, 10) + '...');
  
  try {
    // Initialize Groq API client
    const groqClient = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1"
    });

    // Simple test prompt
    const prompt = "Generate a simple JSON array with 2 tasks for 'Launch a mobile app'. Use this format: [{'title': 'Task 1', 'description': 'Description'}]";
    
    console.log('📝 Sending test prompt to Groq...');
    
    const response = await groqClient.chat.completions.create({
      model: "llama-3.1-8b-instant",
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
    console.log('✅ Groq API Response:');
    console.log(text);
    
    // Test JSON parsing
    const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s);
    if (jsonMatch) {
      console.log('🎯 JSON found, attempting to parse...');
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('✅ Successfully parsed JSON:', parsed);
        console.log('🎉 Groq API is working perfectly!');
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError.message);
      }
    } else {
      console.log('⚠️ No JSON array found in response');
    }
    
  } catch (error) {
    console.error('❌ Groq API Error:', error);
    
    if (error.status === 401) {
      console.log('💡 This is an authentication error. Please check:');
      console.log('1. Your Groq API key is correct');
      console.log('2. The API key has proper permissions');
    } else if (error.status === 429) {
      console.log('💡 Rate limit exceeded. Groq has generous free limits, but you may need to wait.');
    }
  }
}

testGroqAPI();