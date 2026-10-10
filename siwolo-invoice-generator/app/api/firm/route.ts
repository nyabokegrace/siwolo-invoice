import { NextResponse } from "next/server";
import { getFirmProfileDb, saveFirmProfileDb } from "@/lib/db";
import { FirmInfo } from "@/lib/types";

export async function GET() {
  try {
    const firm = await getFirmProfileDb();
    return NextResponse.json({ success: true, data: firm });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error fetching firm profile";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as FirmInfo;
    if (!body || !body.name) {
      return NextResponse.json(
        { success: false, error: "Firm name is required" },
        { status: 400 }
      );
    }
    const success = await saveFirmProfileDb(body);
    return NextResponse.json({ success, data: body });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error saving firm profile";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
