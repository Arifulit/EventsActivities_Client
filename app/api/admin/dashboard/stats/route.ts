import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock data - replace with actual database queries
    const stats = {
      totalUsers: 15234,
      activeUsers: 8921,
      verifiedUsers: 12456,
      bannedUsers: 234,
      pendingUsers: 89,
      totalEvents: 3421,
      activeEvents: 156,
      completedEvents: 2890,
      cancelledEvents: 375,
      totalRevenue: 892341.50,
      monthlyRevenue: 45678.90,
      revenueGrowth: 23.5,
      userGrowth: 18.2,
      eventGrowth: 12.8,
      platformUptime: 99.9,
      serverHealth: 98.5,
      pendingApprovals: 23,
      totalBookings: 8934,
      successfulBookings: 8234,
      cancelledBookings: 700,
      averageRating: 4.7,
      totalHosts: 1234,
      activeHosts: 892,
      pendingHostApprovals: 23
    };

    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
