import { NextRequest, NextResponse } from 'next/server';
import api from '@/app/lib/api';

export async function GET(request: NextRequest) {
  try {
    const response = await api.get('/bookings/user');
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching user bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
