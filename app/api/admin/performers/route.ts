import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Sample top performers data
    const topPerformers = [
      { name: 'Sarah Johnson', role: 'Host', events: 42, rating: 4.9, revenue: 15200 },
      { name: 'Mike Chen', role: 'Host', events: 38, rating: 4.8, revenue: 13800 },
      { name: 'Emma Wilson', role: 'Host', events: 35, rating: 4.7, revenue: 12400 },
      { name: 'Alex Rodriguez', role: 'Organizer', events: 28, rating: 4.6, revenue: 9800 },
    ];

    return NextResponse.json(topPerformers);
  } catch (error) {
    console.error('Error fetching top performers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top performers' },
      { status: 500 }
    );
  }
}
