import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const pool = await getPool();

    const severity = await pool.request().query(`
      SELECT
        severity,
        COUNT(*) AS cnt
      FROM SensorData
      WHERE sensorType='incident'
        AND [timestamp] > DATEADD(hour, -2, GETDATE())
        AND severity IS NOT NULL
      GROUP BY severity
    `);

    const lane = await pool.request().query(`
      SELECT
        CAST(100.0 * SUM(CASE WHEN laneBlocked=1 THEN 1 ELSE 0 END) / NULLIF(COUNT(*),0) AS FLOAT) AS laneBlockedPct
      FROM SensorData
      WHERE sensorType='incident'
        AND [timestamp] > DATEADD(hour, -2, GETDATE())
    `);

    return NextResponse.json({
      severity: severity.recordset,
      laneBlockedPct: Math.round(lane.recordset?.[0]?.laneBlockedPct ?? 0)
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch incident summary" }, { status: 500 });
  }
}
