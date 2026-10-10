import { NextResponse } from "next/server";
import { deleteInvoiceDb } from "@/lib/db";

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
