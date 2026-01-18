import { NextResponse, NextRequest } from 'next/server';

const API_BASE = (process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

async function fetchBackendRevenueAnalytics(request: NextRequest) {
	if (!API_BASE || !API_BASE.startsWith('http://') && !API_BASE.startsWith('https://')) {
		return null;
	}

	const url = `${API_BASE}/admin/analytics/revenue`;

	try {
		const token = request.cookies.get('token')?.value;
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
		};

		if (token) {
			headers['Authorization'] = `Bearer ${token}`;
		}
		const response = await fetch(url, {
			cache: 'no-store',
			signal: AbortSignal.timeout(5000),
			headers,
		});

		if (!response.ok) {
			console.warn('Revenue analytics backend responded with non-OK status:', response.status);
			return null;
		}

		const contentType = response.headers.get('content-type') || '';
		if (!contentType.includes('application/json')) {
			console.warn('Revenue analytics backend returned non-JSON content');
			return null;
		}

		const data = await response.json();
		return NextResponse.json({ ...data, meta: { source: 'backend' } }, { status: response.status });
	} catch (error: unknown) {
		if (error instanceof Error) {
			if (error.message.includes('ECONNREFUSED')) {
				console.log('Backend not available');
			} else if (error.message.includes('timeout')) {
				console.log('Backend request timeout');
			} else {
				console.error('Revenue analytics backend fetch failed:', error);
			}
		}
		return null;
	}
}

export async function GET(request: NextRequest) {
	const backendResponse = await fetchBackendRevenueAnalytics(request);
	if (backendResponse) return backendResponse;

	// Return empty data structure when backend is unavailable
	return NextResponse.json({
		success: false,
		message: 'Backend service unavailable',
		data: {
			period: '30days',
			summary: {
				_id: null,
				totalRevenue: 0,
				totalBookings: 0,
				averageBookingValue: 0,
			},
			dailyRevenue: [],
			revenueByCategory: [],
			topRevenueEvents: [],
		},
		timestamp: new Date().toISOString(),
	}, { status: 503 });
}
