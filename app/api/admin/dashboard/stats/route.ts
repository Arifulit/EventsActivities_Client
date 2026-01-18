import { NextResponse, NextRequest } from 'next/server';

const API_BASE = (process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

async function fetchBackendStats(request: NextRequest) {
	// Only attempt backend fetch if we have a valid external URL
	if (!API_BASE || API_BASE.length === 0) {
		console.log('No backend URL configured');
		return null;
	}

	// Ensure API_BASE is a full URL (starts with http:// or https://)
	if (!API_BASE.startsWith('http://') && !API_BASE.startsWith('https://')) {
		console.warn('Backend API URL must be a full URL (http:// or https://)');
		return null;
	}

	const url = `${API_BASE}/admin/dashboard/stats`;

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
			console.warn('Dashboard stats backend responded with non-OK status:', response.status);
			return null;
		}

		const contentType = response.headers.get('content-type') || '';
		if (!contentType.includes('application/json')) {
			console.warn('Dashboard stats backend returned non-JSON content');
			return null;
		}

		const data = await response.json();
		return NextResponse.json({ ...data, meta: { source: 'backend' } }, { status: response.status });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		if (error instanceof Error) {
			if (error.message.includes('ECONNREFUSED')) {
				console.log('Backend not available');
			} else if (error.message.includes('timeout')) {
				console.log('Backend request timeout');
			} else {
				console.error('Dashboard stats backend fetch failed:', error);
			}
		}
		return null;
	}
}

export async function GET(request: NextRequest) {
	const backendResponse = await fetchBackendStats(request);
	if (backendResponse) return backendResponse;

	// Return empty data structure when backend is unavailable
	return NextResponse.json({
		success: false,
		message: 'Backend service unavailable',
		data: {
			stats: {
				users: { total: 0, active: 0, verified: 0, banned: 0 },
				events: { total: 0, active: 0, completed: 0, cancelled: 0 },
				bookings: { total: 0, confirmed: 0, pending: 0, cancelled: 0 },
				revenue: { total: 0, lastMonth: 0, currency: 'USD' },
			},
			recentActivity: [],
		},
		timestamp: new Date().toISOString(),
	}, { status: 503 });
}
