import { NextResponse, NextRequest } from 'next/server';

const API_BASE = (process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id: hostId } = await params;

	if (!hostId) {
		return NextResponse.json(
			{ error: 'Host ID is required' },
			{ status: 400 }
		);
	}

	if (!API_BASE || (!API_BASE.startsWith('http://') && !API_BASE.startsWith('https://'))) {
		return NextResponse.json(
			{ error: 'Backend unavailable' },
			{ status: 503 }
		);
	}

	const url = `${API_BASE}/admin/hosts/${hostId}/verify`;

	try {
		const token = request.cookies.get('token')?.value;
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
		};

		if (token) {
			headers['Authorization'] = `Bearer ${token}`;
		}

		const body = await request.json().catch(() => ({}));

		const response = await fetch(url, {
			method: 'PATCH',
			cache: 'no-store',
			signal: AbortSignal.timeout(5000),
			headers,
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			console.error(`Backend returned ${response.status} for ${url}`);
			const errorData = await response.json().catch(() => ({ error: 'Failed to verify host' }));
			return NextResponse.json(errorData, { status: response.status });
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error(`Error verifying host: ${hostId}`, error);
		return NextResponse.json(
			{ error: 'Failed to verify host' },
			{ status: 500 }
		);
	}
}