import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const pool = await getPool();
    
    const result = await pool.request().query(`
      SELECT 
        sensorType,
        latitude,
        longitude,
        incidentLocation,
        severity,
        vehicleId,
        stationId
      FROM (
        SELECT *,
          ROW_NUMBER() OVER (PARTITION BY sensorType, 
            COALESCE(incidentLocation, vehicleId, stationId, CAST(latitude as VARCHAR) + CAST(longitude as VARCHAR)) 
            ORDER BY timestamp DESC) as rn
        FROM SensorData 
        WHERE timestamp > DATEADD(minute, -10, GETDATE())
        AND latitude IS NOT NULL
        AND sensorType IN ('incident', 'fleet', 'ev', 'bus')
      ) t
      WHERE rn = 1
    `);

    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
}
