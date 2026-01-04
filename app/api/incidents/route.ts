import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getPool();
    
    const result = await pool.request().query(`
      SELECT TOP 5
        incidentLocation,
        severity,
        incidentType,
        timestamp,
        latitude,
        longitude
      FROM SensorData 
      WHERE sensorType = 'incident'
      AND timestamp > DATEADD(hour, -2, GETDATE())
      ORDER BY timestamp DESC
    `);

    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch incidents' }, { status: 500 });
  }
}
