import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, paymentIntentId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: 'Booking ID is required' },
        { status: 400 }
      );
    }

    if (!paymentIntentId) {
      return NextResponse.json(
        { success: false, message: 'Payment Intent ID is required' },
        { status: 400 }
      );
    }

    // Get token from request headers
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authorization token required' },
        { status: 401 }
      );
    }

    // Call backend API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/confirm`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bookingId,
        paymentIntentId
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Confirm payment error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
