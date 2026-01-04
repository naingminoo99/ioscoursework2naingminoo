import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const pool = await getPool();
    
    // Get counts for top cards
    const incidents = await pool.request().query(`
      SELECT COUNT(*) as count 
      FROM SensorData 
      WHERE sensorType = 'incident' 
      AND severity IN ('HIGH', 'CRITICAL')
      AND timestamp > DATEADD(hour, -1, GETDATE())
    `);
    
    const fleetOnline = await pool.request().query(`
      SELECT COUNT(DISTINCT vehicleId) as count 
      FROM SensorData 
      WHERE sensorType = 'fleet' 
      AND isOnline = 1
      AND timestamp > DATEADD(minute, -5, GETDATE())
    `);
    
    const trainFaults = await pool.request().query(`
      SELECT COUNT(DISTINCT trainId) as count 
      FROM SensorData 
      WHERE sensorType = 'train' 
      AND hasFault = 1
      AND timestamp > DATEADD(hour, -1, GETDATE())
    `);
    
    const evUsage = await pool.request().query(`
      SELECT AVG(CAST(chargerLoad as FLOAT)) as avgLoad 
      FROM SensorData 
      WHERE sensorType = 'ev'
      AND timestamp > DATEADD(minute, -10, GETDATE())
    `);

    return NextResponse.json({
      incidents: incidents.recordset[0].count,
      fleetOnline: fleetOnline.recordset[0].count,
      trainFaults: trainFaults.recordset[0].count,
      evUsage: Math.round(evUsage.recordset[0].avgLoad || 0),
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
