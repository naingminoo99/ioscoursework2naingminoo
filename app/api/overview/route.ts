import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const pool = await getPool();

    // last 30 minutes, bucket by minute
    const result = await pool.request().query(`
      WITH t AS (
        SELECT
          DATEADD(minute, DATEDIFF(minute, 0, [timestamp]), 0) AS bucket,
          sensorType,
          trafficDensity,
          avgSpeed,
          occupancy
        FROM SensorData
        WHERE [timestamp] > DATEADD(minute, -30, GETDATE())
      )
      SELECT TOP 30
        bucket,
        AVG(CASE WHEN sensorType='traffic' THEN CAST(trafficDensity AS FLOAT) END) AS avgTrafficDensity,
        AVG(CASE WHEN sensorType='traffic' THEN CAST(avgSpeed AS FLOAT) END) AS avgSpeed,
        AVG(CASE WHEN sensorType='bus' THEN CAST(occupancy AS FLOAT) END) AS avgBusOccupancy,
        SUM(CASE WHEN sensorType='incident' THEN 1 ELSE 0 END) AS incidentCount
      FROM t
      GROUP BY bucket
      ORDER BY bucket ASC;
    `);

    return NextResponse.json(result.recordset);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch overview" }, { status: 500 });
  }
}
