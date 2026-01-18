import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Call backend API
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
    const backendUrl = apiUrl.endsWith('/api') 
      ? `${apiUrl}/events/${id}`
      : `${apiUrl}/api/events/${id}`;
    
    console.log('🔗 Event Details API URL:', { apiUrl, backendUrl, id });
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Backend API error:');
      console.error('   Status:', response.status);
      console.error('   URL:', backendUrl);
      console.error('   Response:', errorData.substring(0, 200));
      
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, message: 'Event not found' },
          { status: 404 }
        );
      }
      
      throw new Error(`Backend API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('✅ Event details fetched successfully:', { id, title: data.data?.title });

    return NextResponse.json(data);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Event details API error:', errorMessage);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch event details', error: errorMessage },
      { status: 500 }
    );
  }
}
