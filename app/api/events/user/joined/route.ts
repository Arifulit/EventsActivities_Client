import { NextRequest, NextResponse } from 'next/server';
import api from '@/app/lib/api';

export async function GET(request: NextRequest) {
  try {
    const response = await api.get('/events/user/joined');
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching user joined events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch joined events' },
      { status: 500 }
    );
  }
}
