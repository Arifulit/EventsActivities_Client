// Debug script to test the leave event API endpoint
const axios = require('axios');

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function testLeaveEventAPI() {
  console.log('🔍 Testing Leave Event API');
  console.log('API Base URL:', API_BASE_URL);
  console.log('=====================================');

  // Test event ID (you'll need to replace this with a real event ID)
  const testEventId = '507f1f77bcf86cd799439011'; // Example MongoDB ObjectId
  
  try {
    // Test 1: Try to get event details first
    console.log('\n📋 Test 1: Getting event details...');
    try {
      const eventResponse = await axios.get(`${API_BASE_URL}/events/${testEventId}`);
      console.log('✅ Event details retrieved:');
      console.log('  - Title:', eventResponse.data.data?.title);
      console.log('  - Current Participants:', eventResponse.data.data?.currentParticipants);
      console.log('  - Max Participants:', eventResponse.data.data?.maxParticipants);
      console.log('  - Participants Array Length:', eventResponse.data.data?.participants?.length);
    } catch (error) {
      console.error('❌ Failed to get event details:', error.response?.data || error.message);
      return;
    }

    // Test 2: Try to leave event (without authentication - should fail with 401)
    console.log('\n🚪 Test 2: Trying to leave event without auth...');
    try {
      const leaveResponse = await axios.post(`${API_BASE_URL}/events/${testEventId}/leave`);
      console.log('✅ Leave request succeeded (unexpected):', leaveResponse.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('⚠️ Leave failed with 401 (expected - no auth token)');
      } else if (error.response?.status === 500) {
        console.error('❌ Leave failed with 500 (backend error):');
        console.error('Error details:', error.response?.data);
        console.error('This is the error you\'re experiencing!');
      } else {
        console.error('❌ Leave failed with other error:', error.response?.status, error.response?.data);
      }
    }

    // Test 3: Try with a fake auth token
    console.log('\n🚪 Test 3: Trying to leave event with fake auth token...');
    try {
      const leaveResponse = await axios.post(
        `${API_BASE_URL}/events/${testEventId}/leave`,
        {},
        {
          headers: {
            'Authorization': 'Bearer fake-token-for-testing'
          }
        }
      );
      console.log('✅ Leave request succeeded (unexpected):', leaveResponse.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('⚠️ Leave failed with 401 (expected - fake token)');
      } else if (error.response?.status === 500) {
        console.error('❌ Leave failed with 500 (backend error):');
        console.error('Error details:', error.response?.data);
        console.error('This confirms the 500 error is not auth-related');
      } else {
        console.error('❌ Leave failed with other error:', error.response?.status, error.response?.data);
      }
    }

  } catch (error) {
    console.error('❌ Test setup failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Make sure the backend server is running on localhost:5000');
    }
  }
}

// Test with different event ID formats
async function testEventIdFormats() {
  console.log('\n🔍 Testing different event ID formats');
  console.log('=====================================');

  const testIds = [
    '507f1f77bcf86cd799439011', // Valid 24-char hex
    'invalid-id', // Invalid format
    '123', // Too short
    '', // Empty
  ];

  for (const testId of testIds) {
    console.log(`\n📝 Testing ID: "${testId}"`);
    console.log(`  - Length: ${testId.length}`);
    console.log(`  - Is valid ObjectId: /^[0-9a-fA-F]{24}$/.test(testId)`);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/events/${testId}/leave`);
      console.log('  ✅ Request succeeded (unexpected)');
    } catch (error) {
      console.log(`  ❌ Request failed: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }
  }
}

async function main() {
  await testLeaveEventAPI();
  await testEventIdFormats();
  
  console.log('\n📝 Summary:');
  console.log('If you see 500 errors, the issue is likely in the backend code.');
  console.log('Common causes for 500 errors in leave event:');
  console.log('1. Database validation errors (like negative participant counts)');
  console.log('2. Null/undefined values in database operations');
  console.log('3. Incorrect participant array manipulation');
  console.log('4. Missing error handling in backend');
  console.log('5. Race conditions in participant count updates');
}

main().catch(console.error);
