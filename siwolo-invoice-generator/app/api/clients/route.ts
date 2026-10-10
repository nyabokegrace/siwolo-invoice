import { NextResponse } from "next/server";
import { getClientsDb, saveClientDb } from "@/lib/db";
import { ClientInfo } from "@/lib/types";

export async function GET() {
  try {
    const clients = await getClientsDb();
    return NextResponse.json({ success: true, data: clients });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error fetching clients";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ClientInfo;
    if (!body || !body.name) {
      return NextResponse.json(
        { success: false, error: "Client name is required" },
        { status: 400 }
      );
    }
    const success = await saveClientDb(body);
    return NextResponse.json({ success, data: body });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error saving client";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
