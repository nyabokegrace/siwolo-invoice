"use client";

import React from "react";
import Image from "next/image";
import {
  Download,
  Printer,
  Plus,
  Save,
  CheckCircle2,
  Loader2,
  FolderOpen,
  Share2,
  Sparkles,
} from "lucide-react";
import { triggerPrint } from "@/lib/pdf";

interface TopNavProps {
  invoiceNumber: string;
  clientName: string;
  savedInvoicesCount: number;
  isSaved: boolean;
  isSaving?: boolean;
  onSaveInvoice: () => void;
  onOpenInvoicesList: () => void;
  onOpenShareModal: () => void;
  onNewInvoice: () => void;
  onLoadSample: () => void;
  onDownloadPdf: () => Promise<void>;
  isExporting: boolean;
  downloadSuccess: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  invoiceNumber,
  clientName,
  savedInvoicesCount,
  isSaved,
  isSaving,
  onSaveInvoice,
  onOpenInvoicesList,
  onOpenShareModal,
  onNewInvoice,
  onLoadSample,
  onDownloadPdf,
  isExporting,
  downloadSuccess,
}) => {
  const handlePrint = () => {
    triggerPrint();
  };

  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Law Firm Identity */}
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-zinc-200 bg-white shadow-xs shrink-0">
            <Image
              src="/logo.jpeg"
              alt="Siwolo Logo"
              fill
              sizes="36px"
              className="object-contain p-0.5"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-950 text-sm sm:text-base tracking-tight leading-none">
                Siwolo P.O.
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-zinc-800 bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">
                Law Advocates
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 font-medium hidden sm:block truncate max-w-[260px]">
              {clientName ? `Matter: ${clientName} (#${invoiceNumber})` : "Advocate Invoicing & Billing System"}
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Saved Invoices / Ledger Manager */}
          <button
            type="button"
            onClick={onOpenInvoicesList}
            title="View saved invoices history and ledger"
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 rounded-lg transition"
          >
            <FolderOpen className="w-3.5 h-3.5 text-zinc-700" />
            <span className="hidden md:inline">Invoices</span>
            <span className="bg-zinc-800 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
              {savedInvoicesCount}
            </span>
          </button>

          {/* New Invoice Button */}
          <button
            type="button"
            onClick={onNewInvoice}
            title="Create a new clean blank invoice"
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-300 rounded-lg transition"
          >
            <Plus className="w-3.5 h-3.5 text-zinc-900" />
            <span className="hidden sm:inline">New</span>
          </button>

          {/* Save to Ledger Button */}
          <button
            type="button"
            onClick={onSaveInvoice}
            disabled={isSaving}
            title="Save invoice to permanent ledger"
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition border disabled:opacity-60 disabled:cursor-not-allowed ${
              isSaved
                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                : "bg-white hover:bg-zinc-50 text-zinc-900 border-zinc-300"
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-500" />
                <span className="hidden sm:inline">Saving...</span>
              </>
            ) : isSaved ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Saved</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-zinc-700" />
                <span className="hidden sm:inline">Save</span>
              </>
            )}
          </button>

          <div className="h-5 w-px bg-zinc-200 hidden sm:block" />

          {/* Share to Client Button (WhatsApp, Email, Device Share) */}
          <button
            type="button"
            onClick={onOpenShareModal}
            title="Share invoice with client via WhatsApp, Email, or Apps"
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 rounded-lg transition shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5 text-zinc-800" />
            <span>Share</span>
          </button>

          {/* Print Invoice Button */}
          <button
            type="button"
            onClick={handlePrint}
            title="Print or save as PDF via system dialog"
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-300 rounded-lg transition hidden lg:inline-flex"
          >
            <Printer className="w-3.5 h-3.5 text-zinc-600" />
            <span>Print</span>
          </button>

          {/* Download PDF Button (Direct file download to Downloads folder) */}
          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={isExporting}
            title="Download PDF directly to your computer's downloads folder"
            className={`inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 text-xs font-semibold rounded-lg shadow-xs transition ${
              downloadSuccess
                ? "bg-zinc-900 text-white"
                : "bg-black hover:bg-zinc-800 text-white active:scale-98"
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </>
            )}
          </button>

          {/* Optional Sample Reference Demo Button */}
          <button
            type="button"
            onClick={onLoadSample}
            title="Load demo reference sample (Chemelil Trustees from ref.pdf)"
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition hidden xl:flex items-center justify-center"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
