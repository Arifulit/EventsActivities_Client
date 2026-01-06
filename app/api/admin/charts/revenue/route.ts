import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Sample revenue data
    const revenueData = [
      { name: 'Mon', revenue: 4500 },
      { name: 'Tue', revenue: 5200 },
      { name: 'Wed', revenue: 4800 },
      { name: 'Thu', revenue: 6100 },
      { name: 'Fri', revenue: 7300 },
      { name: 'Sat', revenue: 6800 },
      { name: 'Sun', revenue: 5900 },
    ];

    return NextResponse.json(revenueData);
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue data' },
      { status: 500 }
    );
  }
}
