import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Call backend API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, message: 'Event not found' },
          { status: 404 }
        );
      }
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Event details API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch event details' },
      { status: 500 }
    );
  }
}
