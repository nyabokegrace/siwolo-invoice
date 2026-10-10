import { NextResponse } from "next/server";
import { getDbHealth } from "@/lib/db";

export async function GET() {
  const health = await getDbHealth();
  return NextResponse.json({
    status: health.connected ? "connected" : "error",
    database: "postgresql",
    engine: health.engine,
    version: health.version,
    timestamp: new Date().toISOString(),
  });
}
