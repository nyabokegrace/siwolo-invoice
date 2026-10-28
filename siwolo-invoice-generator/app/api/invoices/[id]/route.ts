import { NextResponse } from "next/server";
import { deleteInvoiceDb, updateInvoiceStatusDb } from "@/lib/db";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing invoice ID" },
        { status: 400 }
      );
    }
    const success = await deleteInvoiceDb(id);
    return NextResponse.json({ success });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error deleting invoice";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body as { status: string };
    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "Missing id or status" },
        { status: 400 }
      );
    }
    const success = await updateInvoiceStatusDb(id, status);
    return NextResponse.json({ success });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error updating status";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
