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

export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json();
    
    // Get token from request headers
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      console.warn('⚠️ No token provided for event creation');
      return NextResponse.json(
        { success: false, message: 'Authorization token required' },
        { status: 401 }
      );
    }

    console.log('📝 Creating event with data:', {
      title: eventData.title,
      category: eventData.category,
      date: eventData.date,
      hasImage: !!eventData.image
    });

    // Call backend API to create event
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || 'http://localhost:5000/api';
    const backendUrl = `${API_BASE}/events`;
    
    console.log('🔗 Calling backend:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    // Check if response is HTML (error page) instead of JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const htmlText = await response.text();
      console.error('❌ Backend returned HTML instead of JSON:', htmlText.substring(0, 200));
      return NextResponse.json(
        { 
          success: false, 
          message: 'Backend API is not responding correctly. Please ensure backend server is running.',
          debug: {
            url: backendUrl,
            status: response.status,
            contentType
          }
        },
        { status: 503 }
      );
    }

    const data = await response.json();
    console.log('📥 Backend response:', { status: response.status, success: data?.success });

    if (!response.ok) {
      console.error('❌ Backend returned error:', { status: response.status, data });
      return NextResponse.json(data, { status: response.status });
    }

    console.log('✅ Event created successfully');
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('❌ Event creation error:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack?.split('\n').slice(0, 3)
    });
    
    let errorMessage = 'Failed to create event';
    if (error?.code === 'ECONNREFUSED') {
      errorMessage = 'Cannot connect to backend server. Please ensure it is running.';
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        error: error?.message
      },
      { status: 500 }
    );
  }
}
