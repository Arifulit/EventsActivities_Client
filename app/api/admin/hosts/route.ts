import { NextResponse, NextRequest } from 'next/server';

const API_BASE = (process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

async function fetchFromBackend(endpoint: string, method: string = 'GET', body?: Record<string, unknown>, request?: NextRequest) {
	if (!API_BASE || !API_BASE.startsWith('http://') && !API_BASE.startsWith('https://')) {
		return null;
	}

	const url = `${API_BASE}${endpoint}`;

	try {
		const token = request?.cookies.get('token')?.value;
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
		};

		if (token) {
			headers['Authorization'] = `Bearer ${token}`;
		}

		const fetchOptions: RequestInit = {
			method,
			cache: 'no-store',
			signal: AbortSignal.timeout(5000),
			headers,
		};

		if (body) {
			fetchOptions.body = JSON.stringify(body);
		}

		const response = await fetch(url, fetchOptions);

		if (!response.ok) {
			console.error(`Backend returned ${response.status} for ${url}`);
			return null;
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error(`Error fetching from backend: ${endpoint}`, error);
		return null;
	}
}

// GET - List all hosts with filters
export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const queryString = searchParams.toString();
	
	const backendResponse = await fetchFromBackend(`/admin/hosts${queryString ? '?' + queryString : ''}`, 'GET', undefined, request);

	if (!backendResponse) {
		return NextResponse.json(
			{ error: 'Failed to fetch hosts' },
			{ status: 503 }
		);
	}

	return NextResponse.json(backendResponse);
}

// PATCH - Update host (verify, suspend, approve, etc)
export async function PATCH(request: NextRequest) {
	const { pathname } = new URL(request.url);
	const pathParts = pathname.split('/');
	const hostId = pathParts[pathParts.length - 2];
	const action = pathParts[pathParts.length - 1];

	if (!hostId) {
		return NextResponse.json(
			{ error: 'Host ID is required' },
			{ status: 400 }
		);
	}

	let body;
	try {
		body = await request.json();
	} catch {
		body = {};
	}

	const endpoint = `/admin/hosts/${hostId}/${action}`;
	const backendResponse = await fetchFromBackend(endpoint, 'PATCH', body, request);

	if (!backendResponse) {
		return NextResponse.json(
			{ error: `Failed to ${action} host` },
			{ status: 503 }
		);
	}

	return NextResponse.json(backendResponse);
}
