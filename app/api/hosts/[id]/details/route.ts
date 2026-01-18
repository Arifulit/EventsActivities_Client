import { NextResponse, NextRequest } from 'next/server';

const API_BASE = (process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

async function fetchHostDetailsFromBackend(hostId: string, request: NextRequest) {
	if (!API_BASE || !API_BASE.startsWith('http://') && !API_BASE.startsWith('https://')) {
		return null;
	}

	// Use the /users/:userId/details endpoint from backend
	const url = `${API_BASE}/users/${hostId}/details`;

	try {
		const token = request.cookies.get('token')?.value;
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
		};

		if (token) {
			headers['Authorization'] = `Bearer ${token}`;
		}

		console.log('Fetching host details from backend URL:', url);

		const response = await fetch(url, {
			cache: 'no-store',
			signal: AbortSignal.timeout(10000),
			headers,
		});

		if (!response.ok) {
			console.error(`Backend returned ${response.status} for ${url}`);
			const errorText = await response.text();
			console.error('Error response:', errorText);
			return null;
		}

		const data = await response.json();
		console.log('Backend response received - success:', data?.success);
		return data;
	} catch (error) {
		console.error('Error fetching host details from backend:', error);
		return null;
	}
}

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> | { id: string } }
) {
	// Await params for Next.js 15 compatibility
	const resolvedParams = await Promise.resolve(params);
	const { id: hostId } = resolvedParams;

	console.log('Hosts Details API Route - Host ID:', hostId);

	if (!hostId) {
		return NextResponse.json(
			{ error: 'Host ID is required' },
			{ status: 400 }
		);
	}

	const backendResponse = await fetchHostDetailsFromBackend(hostId, request);

	if (!backendResponse) {
		return NextResponse.json(
			{ error: 'Host not found or backend unavailable' },
			{ status: 404 }
		);
	}

	return NextResponse.json(backendResponse);
}
