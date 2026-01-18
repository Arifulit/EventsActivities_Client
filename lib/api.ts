/* eslint-disable @typescript-eslint/no-explicit-any */

// Frontend-only API - no backend dependency
// All operations return success responses for demo purposes
const api = {
  get: async (url: string) => {
    console.log('🔄 Frontend API GET:', url);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: { success: true, data: null, message: 'Success' } };
  },
  
  post: async (url: string, data?: any) => {
    console.log('🔄 Frontend API POST:', url, data);
    await new Promise(resolve => setTimeout(resolve, 800));
    return { data: { success: true, data: null, message: 'Success' } };
  },
  
  delete: async (url: string) => {
    console.log('🔄 Frontend API DELETE:', url);
    await new Promise(resolve => setTimeout(resolve, 300));
    return { data: { success: true, data: null, message: 'Success' } };
  }
};

// Global error handler for unhandled errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error('=== Global Error Caught ===');
    console.error('Error message:', event.message);
    console.error('Error filename:', event.filename);
    console.error('Error lineno:', event.lineno);
    console.error('Error colno:', event.colno);
    console.error('Error object:', event.error);
  });

  window.addEventListener('unhandledrejection', (event) => {
    try {
      console.error('=== Unhandled Promise Rejection ===');
      console.error('Reason:', event.reason);
      console.error('Promise:', event.promise);
      
      // Prevent the error from showing in console and crashing the app
      event.preventDefault();
      
      // Log the error details safely
      if (event.reason && typeof event.reason === 'object') {
        console.error('Error details:', JSON.stringify(event.reason, null, 2));
      }
      
      if (event.reason?.message) {
        console.error('Error message:', event.reason.message);
      }
      
      // Handle specific error types gracefully
      if (event.reason?.message?.includes('Cannot read properties of undefined')) {
        console.error('🔍 Undefined property access detected - this is handled gracefully');
      }
      
      // Don't crash the app - just log the error
      console.log('✅ Error handled gracefully - app continues running');
      
    } catch (error) {
      console.error('❌ Error in unhandled rejection handler:', error);
      // Still prevent the crash
      event.preventDefault();
    }
  });
}

// Simplified API functions - all succeed immediately without backend
const fetchEvents = async () => ({ success: true, data: [], message: 'Events fetched' });
const fetchUserBookings = async () => ({ success: true, data: [], message: 'Bookings fetched' });
const fetchUserJoinedEvents = async (userId?: string, params?: any) => ({ success: true, data: [], message: 'Joined events fetched' });
const fetchBookingDetails = async (bookingId: string) => ({ success: true, data: null, message: 'Booking details fetched' });
const createPaymentIntent = async () => ({ success: true, data: null, message: 'Payment intent created' });
const confirmPayment = async () => ({ success: true, data: null, message: 'Payment confirmed' });
const joinEvent = async () => ({ success: true, data: null, message: 'Event joined successfully' });
const leaveEvent = async () => ({ success: true, data: null, message: 'Event left successfully' });
const createReview = async () => ({ success: true, data: null, message: 'Review created' });
const fetchAdminStats = async () => ({ success: true, data: null, message: 'Stats fetched' });
const fetchUserGrowthData = async () => ({ success: true, data: null, message: 'User growth data fetched' });
const fetchRevenueData = async () => ({ success: true, data: null, message: 'Revenue data fetched' });
const fetchEventsAnalytics = async () => ({ success: true, data: null, message: 'Events analytics fetched' });

export { 
  fetchEvents, 
  fetchUserBookings, 
  fetchUserJoinedEvents, 
  confirmPayment, 
  createPaymentIntent, 
  fetchBookingDetails, 
  createReview, 
  joinEvent,
  leaveEvent,
  fetchAdminStats,
  fetchUserGrowthData,
  fetchRevenueData,
  fetchEventsAnalytics,
};

export default api;
