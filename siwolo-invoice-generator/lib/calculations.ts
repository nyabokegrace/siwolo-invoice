import { CalculatedTotals, InvoiceData, InvoiceItem } from "./types";

export function calculateItemTotal(item: InvoiceItem): number {
  const qty = Math.max(0, Number(item.quantity) || 0);
  const price = Math.max(0, Number(item.unitPrice) || 0);
  return qty * price;
}

export function calculateInvoiceTotals(invoice: InvoiceData): CalculatedTotals {
  const subtotal = invoice.items.reduce((sum, item) => {
    return sum + calculateItemTotal(item);
  }, 0);

  const rawDiscount = Math.max(0, Number(invoice.discount) || 0);
  const discount = Math.min(rawDiscount, subtotal);

  const taxableAmount = Math.max(0, subtotal - discount);
  const taxRate = Math.max(0, Number(invoice.taxRate) || 0);
  const taxAmount = (taxableAmount * taxRate) / 100;

  const total = taxableAmount + taxAmount;

  return {
    subtotal,
    discount,
    taxableAmount,
    taxRate,
    taxAmount,
    total,
  };
}

export function formatCurrencyAmount(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "0.00";
  }
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatInvoiceDate(dateString: string): string {
  if (!dateString) return "";
  try {
    const parts = dateString.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      // Format as M/D/YYYY to match reference invoice (e.g. 9/24/2026)
      return `${month}/${day}/${year}`;
    }
    const d = new Date(dateString);
    if (!isNaN(d.getTime())) {
      return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    }
  } catch {
    // fallback
  }
  return dateString;
}

export function generateNextInvoiceNumber(currentNumber: string): string {
  // Try to find numbers at the end
  const match = currentNumber.match(/^(.*?)(\d+)$/);
  if (match) {
    const prefix = match[1];
    const numStr = match[2];
    const nextNum = parseInt(numStr, 10) + 1;
    const padded = nextNum.toString().padStart(numStr.length, "0");
    return `${prefix}${padded}`;
  }
  return `${currentNumber}-1`;
}
