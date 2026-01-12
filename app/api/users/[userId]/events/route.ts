import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const status = searchParams.get('status'); // upcoming, past, cancelled
    const type = searchParams.get('type');

    // Build query string for backend API
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(status && { status }),
      ...(type && { type }),
    });

    // Call backend API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/events?${queryParams}`, {
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
    console.error('User Events API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch user events' },
      { status: 500 }
    );
  }
}
