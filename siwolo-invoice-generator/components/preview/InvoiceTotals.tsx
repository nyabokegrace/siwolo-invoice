import React from "react";
import { CalculatedTotals } from "@/lib/types";
import { formatCurrencyAmount } from "@/lib/calculations";

interface InvoiceTotalsProps {
  totals: CalculatedTotals;
  currency: string;
  notes?: string;
}

export const InvoiceTotals: React.FC<InvoiceTotalsProps> = ({
  totals,
  currency,
  notes = "Thank you for your business!",
}) => {
  return (
    <div className="flex flex-row justify-between items-start gap-6 my-4 pt-2 print-avoid-break">
      {/* Left side: Notes and sign-off */}
      <div className="w-[58%] flex flex-col justify-start pr-4">
        <p className="italic text-xs sm:text-sm text-zinc-700 font-medium leading-relaxed">
          {notes}
        </p>
      </div>

      {/* Right side: Summary calculations & TOTAL banner */}
      <div className="w-[38%] flex flex-col space-y-1.5 text-xs sm:text-sm text-zinc-900">
        {/* SUBTOTAL */}
        <div className="flex justify-between items-center py-0.5">
          <span className="font-semibold text-zinc-800 tracking-wide">
            SUBTOTAL
          </span>
          <span className="tabular-nums font-medium text-black">
            {formatCurrencyAmount(totals.subtotal)}
          </span>
        </div>

        {/* DISCOUNT (if applicable) */}
        {totals.discount > 0 && (
          <div className="flex justify-between items-center py-0.5 text-zinc-700">
            <span className="font-medium tracking-wide">DISCOUNT</span>
            <span className="tabular-nums font-medium">
              -{formatCurrencyAmount(totals.discount)}
            </span>
          </div>
        )}

        {/* TAX RATE */}
        <div className="flex justify-between items-center py-0.5">
          <span className="font-semibold text-zinc-800 tracking-wide">
            TAX RATE
          </span>
          <span className="tabular-nums font-medium text-black">
            {totals.taxRate.toFixed(3)}%
          </span>
        </div>

        {/* TAX AMOUNT */}
        <div className="flex justify-between items-center py-0.5">
          <span className="font-semibold text-zinc-800 tracking-wide">
            TAX
          </span>
          <span className="tabular-nums font-medium text-black">
            {totals.taxAmount > 0
              ? formatCurrencyAmount(totals.taxAmount)
              : "-\u2007\u2007"}
          </span>
        </div>

        {/* TOTAL BANNER - Pure Black Theme */}
        <div className="bg-black text-white flex justify-between items-center px-4 py-2 mt-2 font-bold tracking-wider">
          <span className="text-sm sm:text-base uppercase">TOTAL</span>
          <span className="text-sm sm:text-base tabular-nums">
            {currency ? `${currency} ` : ""}
            {formatCurrencyAmount(totals.total)}
          </span>
        </div>
      </div>
    </div>
  );
};
