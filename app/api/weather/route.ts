import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const pool = await getPool();

    const latest = await pool.request().query(`
      SELECT TOP 1
        [timestamp],
        condition,
        roadCondition,
        temperature,
        visibility
      FROM SensorData
      WHERE sensorType='weather'
      ORDER BY [timestamp] DESC
    `);

    const last30 = await pool.request().query(`
      SELECT
        roadCondition,
        COUNT(*) AS cnt
      FROM SensorData
      WHERE sensorType='weather'
        AND [timestamp] > DATEADD(minute, -30, GETDATE())
        AND roadCondition IS NOT NULL
      GROUP BY roadCondition
    `);

    return NextResponse.json({
      latest: latest.recordset[0] ?? null,
      road30m: last30.recordset
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch weather" }, { status: 500 });
  }
}
