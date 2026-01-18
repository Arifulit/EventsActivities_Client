import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, quantity } = body;

    if (!eventId) {
      return NextResponse.json(
        { success: false, message: 'Event ID is required' },
        { status: 400 }
      );
    }

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { success: false, message: 'Valid quantity is required' },
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

    // Build backend URL safely (supports values with or without trailing /api)
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
    const backendUrl = apiBase.endsWith('/payments/create-intent')
      ? apiBase
      : `${apiBase}/payments/create-intent`;

    console.log('🔗 create-intent proxy:', {
      backendUrl,
      hasToken: !!token,
      eventId,
      quantity,
    });

    // Call backend API
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventId,
        quantity
      }),
    });

    const text = await response.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      console.error('⚠️ Backend returned non-JSON for create-intent:', text.substring(0, 200));
      return NextResponse.json(
        { success: false, message: 'Backend returned invalid response for payment intent' },
        { status: 502 }
      );
    }

    if (!response.ok) {
      console.error('❌ Backend create-intent failed:', {
        status: response.status,
        data,
      });
      return NextResponse.json(data || { success: false, message: 'Payment intent failed' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Create payment intent error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
