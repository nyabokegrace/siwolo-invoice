import React from "react";
import { CURRENCY_OPTIONS, PAYMENT_TERMS_OPTIONS } from "@/lib/defaults";
import { generateNextInvoiceNumber } from "@/lib/calculations";
import { Hash, RefreshCw } from "lucide-react";

interface InvoiceDetailsFormProps {
  invoiceNumber: string;
  invoiceDate: string;
  terms: string;
  currency: string;
  onChange: (field: string, value: string) => void;
}

export const InvoiceDetailsForm: React.FC<InvoiceDetailsFormProps> = ({
  invoiceNumber,
  invoiceDate,
  terms,
  currency,
  onChange,
}) => {
  const handleNextNumber = () => {
    const next = generateNextInvoiceNumber(invoiceNumber || "INV-0000");
    onChange("invoiceNumber", next);
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-xs p-4 sm:p-5">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-100">
        <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
          <Hash className="w-4 h-4 text-zinc-800" />
          Invoice Details
        </h3>
        <span className="text-xs text-zinc-500">Document Metadata</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Invoice Number */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1">
            Invoice Number <span className="text-zinc-900 font-bold">*</span>
          </label>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => onChange("invoiceNumber", e.target.value)}
              placeholder="e.g. 1 or INV-0001"
              className="flex-1 px-3 py-2 text-sm bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition font-mono"
              required
            />
            <button
              type="button"
              onClick={handleNextNumber}
              title="Generate Next Number"
              className="px-2.5 py-2 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 rounded-lg text-zinc-700 transition flex items-center justify-center text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Invoice Date */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1">
            Invoice Date <span className="text-zinc-900 font-bold">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => onChange("invoiceDate", e.target.value)}
              className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition"
              required
            />
          </div>
        </div>

        {/* Payment Terms */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1">
            Payment Terms
          </label>
          <div className="relative">
            <input
              type="text"
              list="terms-list"
              value={terms}
              onChange={(e) => onChange("terms", e.target.value)}
              placeholder="e.g. Due upon receipt"
              className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition"
            />
            <datalist id="terms-list">
              {PAYMENT_TERMS_OPTIONS.map((opt) => (
                <option key={opt} value={opt} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Currency */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1">
            Currency
          </label>
          <select
            value={currency}
            onChange={(e) => onChange("currency", e.target.value)}
            className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition"
          >
            {CURRENCY_OPTIONS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
