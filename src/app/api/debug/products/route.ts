// Temporary debug route module to satisfy Next.js type generation.
// Safe to remove entirely if debug endpoints are not needed.
import { NextResponse } from 'next/server';

export async function GET() {
	return NextResponse.json({ status: 'ok', message: 'debug placeholder' });
}

export const dynamic = 'force-dynamic';
