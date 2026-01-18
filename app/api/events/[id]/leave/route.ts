import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get token from request headers
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authorization token required' },
        { status: 401 }
      );
    }

    // Call backend API - NEXT_PUBLIC_API_URL already includes /api
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || 'http://localhost:5000/api';
    const backendUrl = `${API_BASE}/events/${id}/leave`;
    console.log('🚪 Calling backend API:', backendUrl);
    console.log('  - Event ID:', id);
    console.log('  - Token present:', !!token);
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
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

    console.log('✅ Event leave successful');
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Leave event error:', {
      message: error?.message,
      stack: error?.stack?.split('\n').slice(0, 3),
      name: error?.name,
      code: error?.code
    });
    
    // Provide more specific error messages
    let errorMessage = 'Internal server error';
    if (error?.code === 'ECONNREFUSED') {
      errorMessage = 'Cannot connect to backend server. Please ensure it is running.';
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        debug: {
          errorType: error?.name,
          errorCode: error?.code
        }
      },
      { status: 500 }
    );
  }
}
