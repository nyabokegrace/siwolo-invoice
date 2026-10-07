import React from "react";
import { InvoiceItem } from "@/lib/types";
import { InvoiceItemRow } from "./InvoiceItemRow";
import { COMMON_LEGAL_SERVICES } from "@/lib/defaults";
import { Plus, ListOrdered, Sparkles } from "lucide-react";

interface InvoiceItemsFormProps {
  items: InvoiceItem[];
  currency: string;
  onAddItem: (presetDescription?: string) => void;
  onUpdateItem: (id: string, field: keyof InvoiceItem, value: string | number) => void;
  onRemoveItem: (id: string) => void;
  onDuplicateItem: (id: string) => void;
}

export const InvoiceItemsForm: React.FC<InvoiceItemsFormProps> = ({
  items,
  currency,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onDuplicateItem,
}) => {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-xs p-4 sm:p-5">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-100">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-zinc-800" />
            Invoice Items ({items.length})
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Add billable services, legal drafting, court attendances, and rates
          </p>
        </div>
        <button
          type="button"
          onClick={() => onAddItem()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg shadow-xs transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Item
        </button>
      </div>

      {/* Item Rows */}
      <div className="space-y-3 mb-4">
        {items.map((item, index) => (
          <InvoiceItemRow
            key={item.id}
            item={item}
            index={index}
            currency={currency}
            onChange={onUpdateItem}
            onRemove={onRemoveItem}
            onDuplicate={onDuplicateItem}
            canRemove={items.length > 1}
          />
        ))}
      </div>

      {/* Add Item Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={() => onAddItem()}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-900 text-xs font-semibold rounded-lg transition"
        >
          <Plus className="w-3.5 h-3.5 text-black" />
          Add Another Item
        </button>
      </div>

      {/* Quick Legal Fee Presets */}
      <div className="mt-5 pt-4 border-t border-zinc-100">
        <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-zinc-600" />
          <span>Quick Legal Service Suggestions (click to add):</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_LEGAL_SERVICES.slice(0, 8).map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onAddItem(preset)}
              className="text-[11px] bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 px-2.5 py-1 rounded-md transition text-left"
            >
              + {preset}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
