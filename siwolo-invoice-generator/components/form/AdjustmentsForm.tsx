import React from "react";
import { CalculatedTotals } from "@/lib/types";
import { formatCurrencyAmount } from "@/lib/calculations";
import { Calculator, Percent, Tag, MessageSquare } from "lucide-react";

interface AdjustmentsFormProps {
  totals: CalculatedTotals;
  taxRate: number;
  discount: number;
  notes: string;
  currency: string;
  onChangeField: (field: string, value: string | number) => void;
}

export const AdjustmentsForm: React.FC<AdjustmentsFormProps> = ({
  totals,
  taxRate,
  discount,
  notes,
  currency,
  onChangeField,
}) => {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-xs p-4 sm:p-5">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-100">
        <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-zinc-800" />
          Adjustments & Notes
        </h3>
        <span className="text-xs text-zinc-500">Totals Calculation</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column: Tax & Discount Controls */}
        <div className="space-y-4">
          {/* Tax Rate */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-zinc-700 flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-zinc-500" />
                Tax / VAT Rate (%)
              </label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => onChangeField("taxRate", 0)}
                  className={`text-[10px] px-2 py-0.5 rounded transition ${
                    taxRate === 0
                      ? "bg-black text-white font-bold"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  0% (Ref)
                </button>
                <button
                  type="button"
                  onClick={() => onChangeField("taxRate", 16)}
                  className={`text-[10px] px-2 py-0.5 rounded transition ${
                    taxRate === 16
                      ? "bg-black text-white font-bold"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  16% (VAT)
                </button>
              </div>
            </div>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={taxRate === 0 ? "0" : taxRate}
              onChange={(e) =>
                onChangeField(
                  "taxRate",
                  Math.max(0, parseFloat(e.target.value) || 0)
                )
              }
              placeholder="0.00"
              className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
            />
          </div>

          {/* Discount Amount */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-zinc-500" />
              Discount ({currency})
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={discount === 0 ? "" : discount}
              onChange={(e) =>
                onChangeField(
                  "discount",
                  Math.max(0, parseFloat(e.target.value) || 0)
                )
              }
              placeholder="0.00"
              className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
            />
          </div>

          {/* Notes / Special Instructions */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
              Invoice Note / Client Sign-off
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => onChangeField("notes", e.target.value)}
              placeholder="e.g. Thank you for your business!"
              className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
            />
          </div>
        </div>

        {/* Right Column: Live Calculated Breakdown Card */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 flex flex-col justify-between">
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between items-center text-zinc-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-zinc-900 tabular-nums">
                {currency} {formatCurrencyAmount(totals.subtotal)}
              </span>
            </div>

            {totals.discount > 0 && (
              <div className="flex justify-between items-center text-zinc-700">
                <span>Discount applied:</span>
                <span className="font-semibold tabular-nums">
                  -{currency} {formatCurrencyAmount(totals.discount)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center text-zinc-600">
              <span>Tax ({totals.taxRate.toFixed(2)}%):</span>
              <span className="font-semibold text-zinc-900 tabular-nums">
                {totals.taxAmount > 0
                  ? `${currency} ${formatCurrencyAmount(totals.taxAmount)}`
                  : "0.00"}
              </span>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-zinc-200">
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase font-bold text-zinc-700">
                Grand Total
              </span>
              <span className="text-lg font-black text-black tabular-nums">
                {currency} {formatCurrencyAmount(totals.total)}
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">
              Derived automatically from line items, adjustments, and tax rates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
