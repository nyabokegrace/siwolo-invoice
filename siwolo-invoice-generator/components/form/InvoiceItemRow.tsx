import React from "react";
import { InvoiceItem } from "@/lib/types";
import { calculateItemTotal, formatCurrencyAmount } from "@/lib/calculations";
import { Trash2, Copy } from "lucide-react";

interface InvoiceItemRowProps {
  item: InvoiceItem;
  index: number;
  currency?: string;
  onChange: (id: string, field: keyof InvoiceItem, value: string | number) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  canRemove: boolean;
}

export const InvoiceItemRow: React.FC<InvoiceItemRowProps> = ({
  item,
  index,
  currency = "KES",
  onChange,
  onRemove,
  onDuplicate,
  canRemove,
}) => {
  const lineTotal = calculateItemTotal(item);

  return (
    <div className="bg-zinc-50/90 hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-lg p-3 transition space-y-2.5">
      {/* Top Row: Description + Actions */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold text-black bg-zinc-200 w-5 h-5 rounded flex items-center justify-center shrink-0">
          {index + 1}
        </span>
        <div className="flex-1">
          <input
            type="text"
            value={item.description}
            onChange={(e) => onChange(item.id, "description", e.target.value)}
            placeholder="Service description (e.g. Legal Consultation, Court Attendance...)"
            className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-white border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 font-medium"
            required
          />
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onDuplicate(item.id)}
            title="Duplicate Item"
            className="p-1.5 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-200/60 rounded transition"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            disabled={!canRemove}
            title={canRemove ? "Remove Item" : "At least one item is required"}
            className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:hover:text-zinc-400 disabled:hover:bg-transparent rounded transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Row: Qty, Unit Price, Amount */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-zinc-200/80 text-xs">
        {/* Quantity */}
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-500 font-medium text-[11px]">Qty:</span>
          <input
            type="number"
            min="0"
            step="1"
            value={item.quantity === 0 ? "" : item.quantity}
            onChange={(e) => {
              const val = e.target.value === "" ? 0 : Math.max(0, parseFloat(e.target.value) || 0);
              onChange(item.id, "quantity", val);
            }}
            placeholder="1"
            className="w-16 px-2 py-1 text-xs bg-white border border-zinc-300 rounded-md text-center focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
          />
        </div>

        {/* Unit Price */}
        <div className="flex items-center gap-1.5 flex-1 min-w-[140px] max-w-[220px]">
          <span className="text-zinc-500 font-medium text-[11px]">Rate:</span>
          <div className="relative flex-1">
            <span className="absolute left-2 top-1 text-[11px] text-zinc-400 font-medium">
              {currency}
            </span>
            <input
              type="number"
              min="0"
              step="any"
              value={item.unitPrice === 0 ? "" : item.unitPrice}
              onChange={(e) => {
                const val = e.target.value === "" ? 0 : Math.max(0, parseFloat(e.target.value) || 0);
                onChange(item.id, "unitPrice", val);
              }}
              placeholder="0.00"
              className="w-full pl-10 pr-2 py-1 text-xs bg-white border border-zinc-300 rounded-md text-right tabular-nums focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
            />
          </div>
        </div>

        {/* Calculated Amount */}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-zinc-500 font-medium text-[11px]">Amount:</span>
          <span className="font-semibold text-black tabular-nums text-xs">
            {currency} {formatCurrencyAmount(lineTotal)}
          </span>
        </div>
      </div>
    </div>
  );
};
