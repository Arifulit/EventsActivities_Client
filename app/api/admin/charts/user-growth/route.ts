import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Sample chart data for user growth
    const userGrowthData = [
      { name: 'Jan', users: 1200 },
      { name: 'Feb', users: 1500 },
      { name: 'Mar', users: 1800 },
      { name: 'Apr', users: 2100 },
      { name: 'May', users: 2300 },
      { name: 'Jun', users: 2548 },
    ];

    return NextResponse.json(userGrowthData);
  } catch (error) {
    console.error('Error fetching user growth data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user growth data' },
      { status: 500 }
    );
  }
}
