"use client";

import React, { useState, useRef } from "react";
import { InvoiceData, InvoiceStatus } from "@/lib/types";
import { formatCurrencyAmount, formatInvoiceDate } from "@/lib/calculations";
import {
  X,
  Search,
  Plus,
  FolderOpen,
  Copy,
  Trash2,
  Download,
  Upload,
  CheckCircle2,
} from "lucide-react";
import {
  exportBackupJson,
  importBackupJson,
  updateInvoiceStatus,
} from "@/lib/storage";

interface SavedInvoicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: InvoiceData[];
  onSelectInvoice: (invoice: InvoiceData) => void;
  onNewInvoice: () => void;
  onDuplicateInvoice: (invoice: InvoiceData) => void;
  onDeleteInvoice: (id: string) => void;
  onReloadInvoices: () => void;
  currentInvoiceId?: string;
  onDownloadPdfDirectly?: (invoice: InvoiceData) => Promise<void>;
}

export const SavedInvoicesModal: React.FC<SavedInvoicesModalProps> = ({
  isOpen,
  onClose,
  invoices,
  onSelectInvoice,
  onNewInvoice,
  onDuplicateInvoice,
  onDeleteInvoice,
  onReloadInvoices,
  currentInvoiceId,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | InvoiceStatus>("all");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [backupNotice, setBackupNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesStatus;

    const matchesQuery =
      (inv.invoiceNumber || "").toLowerCase().includes(query) ||
      (inv.client?.name || "").toLowerCase().includes(query) ||
      (inv.client?.customerId || "").toLowerCase().includes(query) ||
      (inv.notes || "").toLowerCase().includes(query);

    return matchesStatus && matchesQuery;
  });

  // Calculate counts
  const countAll = invoices.length;
  const countDraft = invoices.filter((i) => i.status === "draft").length;
  const countIssued = invoices.filter((i) => i.status === "issued").length;
  const countPaid = invoices.filter((i) => i.status === "paid").length;

  const handleStatusChange = (id: string, newStatus: InvoiceStatus) => {
    updateInvoiceStatus(id, newStatus);
    onReloadInvoices();
  };

  const handleExportBackup = () => {
    const jsonStr = exportBackupJson();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Siwolo_Invoices_Backup_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setBackupNotice("Backup file downloaded successfully!");
    setTimeout(() => setBackupNotice(null), 3000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importBackupJson(content);
      if (res.success) {
        onReloadInvoices();
        setBackupNotice(res.message);
      } else {
        alert(res.message);
      }
      setTimeout(() => setBackupNotice(null), 4000);
    };
    reader.readAsText(file);
    if (e.target) e.target.value = "";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-950 flex items-center gap-2">
                Saved Invoices & Ledger
                <span className="text-xs bg-zinc-200 text-zinc-800 px-2 py-0.5 rounded-full font-mono font-medium">
                  {countAll} Total
                </span>
              </h3>
              <p className="text-xs text-zinc-500">
                Manage, edit, duplicate, and track invoice statuses
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search, Filters, New Button */}
        <div className="px-6 py-3 border-b border-zinc-200 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by invoice #, client, matter, or PIN..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2 text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Filter Tabs */}
            <div className="flex bg-zinc-100 p-0.5 rounded-lg border border-zinc-200 text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  statusFilter === "all"
                    ? "bg-white text-black shadow-xs font-semibold"
                    : "text-zinc-600 hover:text-black"
                }`}
              >
                All ({countAll})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("draft")}
                className={`px-2 py-1 rounded-md font-medium transition ${
                  statusFilter === "draft"
                    ? "bg-white text-zinc-900 shadow-xs font-semibold"
                    : "text-zinc-600 hover:text-black"
                }`}
              >
                Draft ({countDraft})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("issued")}
                className={`px-2 py-1 rounded-md font-medium transition ${
                  statusFilter === "issued"
                    ? "bg-white text-blue-700 shadow-xs font-semibold"
                    : "text-zinc-600 hover:text-black"
                }`}
              >
                Issued ({countIssued})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("paid")}
                className={`px-2 py-1 rounded-md font-medium transition ${
                  statusFilter === "paid"
                    ? "bg-white text-emerald-700 shadow-xs font-semibold"
                    : "text-zinc-600 hover:text-black"
                }`}
              >
                Paid ({countPaid})
              </button>
            </div>

            {/* New Invoice Button */}
            <button
              type="button"
              onClick={() => {
                onNewInvoice();
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              New Invoice
            </button>
          </div>
        </div>

        {/* Backup Feedback Banner */}
        {backupNotice && (
          <div className="px-6 py-2 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{backupNotice}</span>
          </div>
        )}

        {/* Invoices List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
              <FolderOpen className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-zinc-800">No invoices found</h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-4">
                {searchQuery
                  ? "No invoices matched your search filter. Try clearing the search."
                  : "You don't have any saved invoices in this view yet."}
              </p>
              <button
                type="button"
                onClick={() => {
                  onNewInvoice();
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Create New Invoice
              </button>
            </div>
          ) : (
            filteredInvoices.map((inv) => {
              const isCurrent = inv.id === currentInvoiceId;
              const subtotal = inv.items.reduce(
                (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
                0
              );
              const discount = Math.min(inv.discount || 0, subtotal);
              const tax = ((subtotal - discount) * (inv.taxRate || 0)) / 100;
              const totalAmount = subtotal - discount + tax;
              const currency = inv.currency || "KES";

              return (
                <div
                  key={inv.id}
                  className={`border rounded-xl p-4 transition flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 ${
                    isCurrent
                      ? "border-black bg-zinc-50 shadow-xs"
                      : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-xs"
                  }`}
                >
                  {/* Left: Invoice Info */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-sm text-zinc-950 bg-zinc-100 border border-zinc-300 px-2 py-0.5 rounded">
                        #{inv.invoiceNumber}
                      </span>

                      {/* Status Dropdown/Selector */}
                      <select
                        value={inv.status || "draft"}
                        onChange={(e) =>
                          handleStatusChange(inv.id!, e.target.value as InvoiceStatus)
                        }
                        className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border cursor-pointer ${
                          inv.status === "paid"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : inv.status === "issued"
                            ? "bg-blue-50 text-blue-800 border-blue-300"
                            : "bg-zinc-100 text-zinc-800 border-zinc-300"
                        }`}
                      >
                        <option value="draft">● Draft</option>
                        <option value="issued">● Issued / Sent</option>
                        <option value="paid">● Paid</option>
                      </select>

                      {isCurrent && (
                        <span className="text-[10px] bg-black text-white px-1.5 py-0.5 rounded font-medium">
                          Active in Editor
                        </span>
                      )}
                    </div>

                    {/* Client & Date */}
                    <div className="text-xs text-zinc-800 font-semibold pt-1">
                      {inv.client?.name ? (
                        <span>{inv.client.name}</span>
                      ) : (
                        <span className="text-zinc-400 italic">Unassigned Client</span>
                      )}
                      {inv.client?.customerId && (
                        <span className="text-zinc-500 font-mono text-[11px] font-normal ml-2">
                          PIN: {inv.client.customerId}
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-zinc-500 flex items-center gap-3">
                      <span>Date: {formatInvoiceDate(inv.invoiceDate)}</span>
                      <span>•</span>
                      <span>Items: {inv.items.length}</span>
                      {inv.updatedAt && (
                        <>
                          <span>•</span>
                          <span>
                            Updated {new Date(inv.updatedAt).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-100">
                    <div className="text-right">
                      <span className="text-xs text-zinc-500 block">Total Due</span>
                      <span className="font-mono font-bold text-sm sm:text-base text-zinc-950">
                        {currency} {formatCurrencyAmount(totalAmount)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Load into editor button */}
                      <button
                        type="button"
                        onClick={() => {
                          onSelectInvoice(inv);
                          onClose();
                        }}
                        className="px-2.5 py-1.5 text-xs font-semibold bg-zinc-100 hover:bg-black hover:text-white text-zinc-900 border border-zinc-300 rounded-lg transition"
                      >
                        Open
                      </button>

                      {/* Duplicate button */}
                      <button
                        type="button"
                        onClick={() => {
                          onDuplicateInvoice(inv);
                          onClose();
                        }}
                        title="Duplicate Invoice"
                        className="p-1.5 text-zinc-500 hover:text-black hover:bg-zinc-100 border border-zinc-200 rounded-lg transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete button */}
                      {deleteConfirmId === inv.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteInvoice(inv.id!);
                              setDeleteConfirmId(null);
                            }}
                            className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold rounded transition"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-1.5 py-1 text-zinc-500 hover:text-zinc-800 text-[11px] rounded transition"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(inv.id!)}
                          title="Delete Invoice"
                          className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 border border-zinc-200 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer: Backup Export/Import */}
        <div className="px-6 py-3 border-t border-zinc-200 bg-zinc-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportBackup}
              title="Download JSON backup of all invoices and clients"
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-700 rounded-md transition font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              Backup Data (JSON)
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Restore from JSON backup file"
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-700 rounded-md transition font-medium"
            >
              <Upload className="w-3.5 h-3.5" />
              Restore Backup
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 font-medium text-zinc-700 hover:text-zinc-950 bg-white border border-zinc-300 rounded-lg shadow-xs hover:bg-zinc-100 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
