import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Public statistics that don't require authentication
    // In a real application, these would come from your database
    const stats = {
      totalUsers: 2548,
      totalEvents: 542,
      citiesCovered: 45,
      averageRating: 4.7
    };

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching public stats:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch platform statistics' 
      },
      { status: 500 }
    );
  }
}
