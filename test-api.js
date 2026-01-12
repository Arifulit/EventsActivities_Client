// Simple API test to debug the issue
const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing API connection...');
    console.log('URL: http://localhost:5000/api/events');
    
    const response = await axios.get('http://localhost:5000/api/events', {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ API Response:', response.status);
    console.log('Data type:', typeof response.data);
    console.log('First 100 chars:', JSON.stringify(response.data).substring(0, 100));
    
  } catch (error) {
    console.log('❌ API Error:');
    console.log('Status:', error.response?.status);
    console.log('StatusText:', error.response?.statusText);
    
    if (error.response?.data) {
      const data = error.response.data;
      console.log('Response data type:', typeof data);
      console.log('Is HTML?', typeof data === 'string' && data.includes('<!DOCTYPE'));
      console.log('First 200 chars:', data.substring(0, 200));
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Connection refused - Backend server is not running');
    } else if (error.code === 'ECONNABORTED') {
      console.log('❌ Timeout - Backend server is not responding');
    }
  }
}

testAPI();
