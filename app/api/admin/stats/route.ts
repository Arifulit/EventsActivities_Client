import { NextResponse } from 'next/server';

// Simple fallback admin stats route to satisfy Next.js route typing
export async function GET() {
	return NextResponse.json({
		success: true,
		message: 'Admin stats fallback',
		data: {
			totalUsers: 0,
			totalEvents: 0,
			activeEvents: 0,
			completedEvents: 0,
		},
		timestamp: new Date().toISOString(),
	});
}
