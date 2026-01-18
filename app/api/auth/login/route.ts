import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // TODO: Implement actual authentication logic
    // For now, return a mock response for testing
    if (email && password) {
      // Mock user data - replace with actual authentication
      const mockUser = {
        _id: 'mock-user-id',
        email: email,
        fullName: 'Test User',
        role: 'user',
        isVerified: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const mockToken = 'mock-jwt-token-' + Date.now();

      return NextResponse.json({
        success: true,
        message: 'Login successful',
        data: {
          user: mockUser,
          accessToken: mockToken
        },
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json(
      { success: false, message: 'Email and password are required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
