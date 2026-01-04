import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const pool = await getPool();
    
    const result = await pool.request().query(`
      SELECT 
        AVG(CAST(fuelMpg as FLOAT)) as avgFuelMpg,
        COUNT(CASE WHEN isOnline = 0 THEN 1 END) as idleVehicles,
        COUNT(CASE WHEN healthStatus IN ('WARNING', 'ALERT') THEN 1 END) as healthAlerts
      FROM (
        SELECT *,
          ROW_NUMBER() OVER (PARTITION BY vehicleId ORDER BY timestamp DESC) as rn
        FROM SensorData 
        WHERE sensorType = 'fleet'
        AND timestamp > DATEADD(minute, -10, GETDATE())
      ) t
      WHERE rn = 1
    `);

    return NextResponse.json(result.recordset[0]);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch fleet' }, { status: 500 });
  }
}
