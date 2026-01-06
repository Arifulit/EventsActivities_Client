import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const location = searchParams.get('location');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const isFree = searchParams.get('isFree');
    const search = searchParams.get('search');

    // Build query string for backend API
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(type && { type }),
      ...(status && { status }),
      ...(location && { location }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(isFree && { isFree }),
      ...(search && { search }),
    });

    // Call backend API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Events API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
