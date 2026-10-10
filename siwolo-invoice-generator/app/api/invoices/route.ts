import { NextResponse } from "next/server";
import { getInvoicesDb, saveInvoiceDb } from "@/lib/db";
import { InvoiceData } from "@/lib/types";

export async function GET() {
  try {
    const invoices = await getInvoicesDb();
    return NextResponse.json({ success: true, data: invoices });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error fetching invoices";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as InvoiceData;
    if (!body || !body.invoiceNumber) {
      return NextResponse.json(
        { success: false, error: "Invalid invoice payload" },
        { status: 400 }
      );
    }
    const success = await saveInvoiceDb(body);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Failed to persist to database" },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true, data: body });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error saving invoice";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
