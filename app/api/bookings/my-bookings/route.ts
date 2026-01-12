import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const status = searchParams.get('status'); // confirmed, pending, cancelled, completed
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query string for backend API
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(status && { status }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    });

    // Call backend API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/my-bookings?${queryParams}`, {
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
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('My Bookings API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch user bookings' },
      { status: 500 }
    );
  }
}
