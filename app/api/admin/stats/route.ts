import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // In a real application, these would come from your database
    // For now, we'll simulate the data structure
    const stats = {
      totalUsers: 2548,
      verifiedUsers: 1987,
      bannedUsers: 42,
      pendingUsers: 67,
      totalEvents: 542,
      activeEvents: 128,
      completedEvents: 387,
      cancelledEvents: 27,
      totalRevenue: 124850,
      pendingApprovals: 23,
      systemAlerts: 5,
      serverHealth: 94,
      userGrowth: 12.5,
      revenueGrowth: 24.3,
      eventGrowth: 8.2,
      platformUptime: 99.8
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
}
