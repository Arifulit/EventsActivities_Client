import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hostId: string }> }
) {
  try {
    const { hostId } = await params;
    const { searchParams } = new URL(request.url);
    
    // Extract optional query parameters
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query string for backend API
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    // Call backend API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/host/${hostId}/stats?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization header if present
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        }),
      },
    });

    if (!response.ok) {
      // If the backend route doesn't exist, return fallback data
      if (response.status === 404) {
        return NextResponse.json({
          success: true,
          data: {
            totalReviews: 0,
            averageRating: 0,
            ratingDistribution: {
              5: 0,
              4: 0,
              3: 0,
              2: 0,
              1: 0
            },
            recentReviews: []
          }
        });
      }
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Host Review Stats API error:', error);
    
    // Return fallback data on error
    return NextResponse.json({
      success: true,
      data: {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0
        },
        recentReviews: []
      }
    });
  }
}
