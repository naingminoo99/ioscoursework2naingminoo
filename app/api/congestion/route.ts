import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getPool();
    
    const result = await pool.request().query(`
      SELECT TOP 20
        timestamp,
        trafficDensity
      FROM SensorData 
      WHERE sensorType = 'traffic'
      AND timestamp > DATEADD(minute, -30, GETDATE())
      ORDER BY timestamp ASC
    `);

    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch congestion' }, { status: 500 });
  }
}
