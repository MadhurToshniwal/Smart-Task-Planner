const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function listModels() {
  console.log('🔧 Listing available Gemini models...');
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ Gemini API key not found in environment variables');
    return;
  }
  
  console.log('✅ Gemini API key found:', process.env.GEMINI_API_KEY.substring(0, 10) + '...');
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // List available models
    const models = await genAI.listModels();
    
    console.log('✅ Available models:');
    for (const model of models) {
      console.log(`- ${model.name}: ${model.displayName}`);
      console.log(`  Supported methods: ${model.supportedGenerationMethods.join(', ')}`);
    }
    
  } catch (error) {
    console.error('❌ Error listing models:', error.message);
    
    if (error.status === 400) {
      console.log('💡 This might be an API key issue. Please verify:');
      console.log('1. Your API key is correct and active');
      console.log('2. You have enabled the Generative AI API');
      console.log('3. Your API key has proper permissions');
    }
  }
}

listModels();