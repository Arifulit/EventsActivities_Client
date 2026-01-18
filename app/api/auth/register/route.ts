import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName, location } = body;

    // TODO: Implement actual registration logic
    // For now, return a mock response for testing
    if (email && password && fullName) {
      // Mock user data - replace with actual registration
      const mockUser = {
        _id: 'mock-user-id-' + Date.now(),
        email: email,
        fullName: fullName,
        role: 'user',
        isVerified: false,
        isActive: true,
        location: location || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const mockToken = 'mock-jwt-token-' + Date.now();

      return NextResponse.json({
        success: true,
        message: 'Registration successful',
        data: {
          user: mockUser,
          accessToken: mockToken
        },
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json(
      { success: false, message: 'Email, password, and full name are required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
