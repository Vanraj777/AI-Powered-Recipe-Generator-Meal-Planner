const OpenAI = require('openai');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const apiKey = process.env.OPENAI_API_KEY?.trim();

console.log('Testing OpenAI Connection...');
console.log('API Key length:', apiKey ? apiKey.length : 0);
console.log('API Key starts with:', apiKey ? apiKey.substring(0, Math.min(10, apiKey.length)) : 'none');

if (!apiKey || apiKey.length < 10) {
  console.error(' API Key is missing or too short');
  process.exit(1);
}

const openai = new OpenAI({ apiKey: apiKey });

async function testConnection() {
  try {
    console.log(' Testing OpenAI API connection...');
    const response = await openai.models.list();
    console.log(' Connection successful!');
    console.log('   Available models:', response.data.length);
    process.exit(0);
  } catch (error) {
    console.error(' Connection failed!');
    console.error('   Error:', error.message);
    console.error('   Status:', error.status);
    console.error('   Code:', error.code);
    if (error.response) {
      console.error('   Response:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

testConnection();
