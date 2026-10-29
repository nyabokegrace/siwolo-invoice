import { NextResponse } from "next/server";
import { getNextInvoiceNumberDb } from "@/lib/db";

export async function GET() {
  try {
    const nextNumber = await getNextInvoiceNumberDb();
    return NextResponse.json({ success: true, nextNumber });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error getting next invoice number";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
