import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const pool = await getPool();
    
    const result = await pool.request().query(`
      SELECT TOP 10
        timestamp,
        currentKw
      FROM SensorData 
      WHERE sensorType = 'ev'
      AND timestamp > DATEADD(minute, -20, GETDATE())
      ORDER BY timestamp ASC
    `);
    
    const stations = await pool.request().query(`
      SELECT 
        COUNT(DISTINCT stationId) as available,
        32 as total
      FROM SensorData 
      WHERE sensorType = 'ev'
      AND evIsAvailable = 1
      AND timestamp > DATEADD(minute, -5, GETDATE())
    `);

    return NextResponse.json({
      data: result.recordset,
      stations: stations.recordset[0]
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch EV data' }, { status: 500 });
  }
}
