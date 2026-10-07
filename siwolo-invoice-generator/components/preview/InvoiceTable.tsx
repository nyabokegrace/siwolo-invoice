import React from "react";
import { InvoiceItem } from "@/lib/types";
import { calculateItemTotal, formatCurrencyAmount } from "@/lib/calculations";

interface InvoiceTableProps {
  items: InvoiceItem[];
  currency?: string;
  minLedgerRows?: number;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  items,
  minLedgerRows = 10,
}) => {
  const emptyRowsCount = Math.max(0, minLedgerRows - items.length);

  return (
    <div className="w-full my-4 border border-zinc-300 print-avoid-break">
      <table className="w-full border-collapse text-left">
        {/* Table Header */}
        <thead>
          <tr className="bg-black text-white text-[11px] font-bold uppercase tracking-wider">
            <th className="py-2 px-3 border-r border-zinc-800 w-[54%]">
              DESCRIPTION
            </th>
            <th className="py-2 px-2 text-center border-r border-zinc-800 w-[12%]">
              QTY
            </th>
            <th className="py-2 px-3 text-right border-r border-zinc-800 w-[17%]">
              UNIT PRICE
            </th>
            <th className="py-2 px-3 text-right w-[17%]">AMOUNT</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="text-xs sm:text-[13px] text-zinc-900 divide-y divide-zinc-200">
          {items.map((item) => {
            const lineTotal = calculateItemTotal(item);
            return (
              <tr key={item.id} className="hover:bg-zinc-50/70">
                <td className="py-1.5 px-3 border-r border-zinc-300 font-medium text-black">
                  {item.description || (
                    <span className="text-zinc-300 italic">No description</span>
                  )}
                </td>
                <td className="py-1.5 px-2 text-center border-r border-zinc-300">
                  {item.quantity || 0}
                </td>
                <td className="py-1.5 px-3 text-right border-r border-zinc-300 tabular-nums">
                  {formatCurrencyAmount(item.unitPrice)}
                </td>
                <td className="py-1.5 px-3 text-right tabular-nums font-semibold text-black">
                  {formatCurrencyAmount(lineTotal)}
                </td>
              </tr>
            );
          })}

          {/* Ledger Placeholder Rows to match ref.pdf structure */}
          {Array.from({ length: emptyRowsCount }).map((_, index) => (
            <tr key={`empty-row-${index}`} className="h-7">
              <td className="py-1.5 px-3 border-r border-zinc-300">&nbsp;</td>
              <td className="py-1.5 px-2 border-r border-zinc-300 text-center text-zinc-300 text-xs">
                &nbsp;
              </td>
              <td className="py-1.5 px-3 border-r border-zinc-300 text-right text-zinc-300 text-xs">
                &nbsp;
              </td>
              <td className="py-1.5 px-3 text-right text-zinc-400 text-xs tabular-nums">
                -&nbsp;&nbsp;
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
