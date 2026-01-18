import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const backendUrl = `${BACKEND_URL}/events/my-events`;
    console.log('Fetching my events from:', backendUrl);

    const response = await axios.get(backendUrl, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    });

    console.log('My events response status:', response.status);

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching my events:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    if (error.response) {
      return NextResponse.json(
        error.response.data || { error: 'Failed to fetch my events' },
        { status: error.response.status }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch my events' },
      { status: 500 }
    );
  }
}
