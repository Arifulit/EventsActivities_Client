// Test API connection
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testAPI() {
  try {
    console.log('Testing API connection to:', API_URL);
    
    // Test basic connection
    const response = await axios.get(`${API_URL}/events`, { timeout: 5000 });
    console.log('✅ API is running!');
    console.log('Response status:', response.status);
    console.log('Data sample:', response.data?.data?.slice(0, 2));
    
  } catch (error) {
    console.log('❌ API Connection Error:');
    if (error.code === 'ECONNREFUSED') {
      console.log('   - Backend server is not running on port 5000');
      console.log('   - Please start the backend server first');
    } else if (error.code === 'ERR_NETWORK') {
      console.log('   - Network error - check if backend is running');
    } else if (error.response?.status === 404) {
      console.log('   - API endpoint not found (404)');
      console.log('   - Backend may be running but missing /events endpoint');
    } else {
      console.log('   - Error:', error.message);
      console.log('   - Status:', error.response?.status);
    }
  }
}

testAPI();
