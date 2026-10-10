"use client";

import React from "react";
import { CalculatedTotals, InvoiceStatus } from "@/lib/types";
import { formatCurrencyAmount } from "@/lib/calculations";
import { Edit3, Eye } from "lucide-react";

interface SummaryBarProps {
  invoiceNumber: string;
  clientName: string;
  itemCount: number;
  totals: CalculatedTotals;
  currency: string;
  status?: InvoiceStatus;
  onStatusChange?: (status: InvoiceStatus) => void;
  activeTab: "editor" | "preview";
  setActiveTab: (tab: "editor" | "preview") => void;
  isAutoSaved?: boolean;
}

export const SummaryBar: React.FC<SummaryBarProps> = ({
  invoiceNumber,
  clientName,
  itemCount,
  totals,
  currency,
  status = "draft",
  onStatusChange,
  activeTab,
  setActiveTab,
  isAutoSaved,
}) => {
  return (
    <div className="no-print bg-zinc-950 text-zinc-100 border-b border-zinc-800 px-4 sm:px-6 lg:px-8 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Quick Stats */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400 font-medium">Invoice:</span>
            <span className="font-semibold text-white bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 font-mono">
              #{invoiceNumber || "—"}
            </span>
          </div>

          {/* Status Badge */}
          {onStatusChange ? (
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value as InvoiceStatus)}
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border cursor-pointer focus:outline-none ${
                status === "paid"
                  ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                  : status === "issued"
                  ? "bg-blue-950 text-blue-300 border-blue-800"
                  : "bg-zinc-900 text-zinc-300 border-zinc-700"
              }`}
            >
              <option value="draft">Draft</option>
              <option value="issued">Issued</option>
              <option value="paid">Paid</option>
            </select>
          ) : (
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                status === "paid"
                  ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                  : status === "issued"
                  ? "bg-blue-950 text-blue-300 border-blue-800"
                  : "bg-zinc-900 text-zinc-300 border-zinc-700"
              }`}
            >
              {status}
            </span>
          )}

          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400 font-medium">Client:</span>
            <span className="font-medium text-zinc-200 truncate max-w-[200px]">
              {clientName || <span className="text-zinc-500 italic">Unassigned</span>}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400 font-medium">Items:</span>
            <span className="font-semibold text-zinc-200">{itemCount}</span>
          </div>

          <div className="flex items-center gap-1.5 pl-1 sm:pl-3 sm:border-l border-zinc-800">
            <span className="text-zinc-400 font-medium">Total:</span>
            <span className="font-bold text-white font-mono text-sm">
              {currency} {formatCurrencyAmount(totals.total)}
            </span>
          </div>

          {isAutoSaved && (
            <span className="text-[10px] text-zinc-500 hidden md:inline-flex items-center gap-1">
              ✓ Auto-saved
            </span>
          )}
        </div>

        {/* View Switcher for Small/Medium Screens */}
        <div className="lg:hidden flex items-center bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("editor")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition ${
              activeTab === "editor"
                ? "bg-zinc-800 text-white shadow-xs"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            Editor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition ${
              activeTab === "preview"
                ? "bg-zinc-800 text-white shadow-xs"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Live Preview
          </button>
        </div>
      </div>
    </div>
  );
};
