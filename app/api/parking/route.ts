import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const pool = await getPool();
    
    // Mock parking data since we don't have it in stream
    return NextResponse.json({
      occupied: 145,
      available: 54,
      total: 199,
      percentage: 73
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch parking' }, { status: 500 });
  }
}
