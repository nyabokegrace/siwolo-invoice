"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Download, Printer, RotateCcw, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { generatePdf, triggerPrint } from "@/lib/pdf";

interface TopNavProps {
  invoiceNumber: string;
  clientName: string;
  onLoadSample: () => void;
  onReset: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  invoiceNumber,
  clientName,
  onLoadSample,
  onReset,
}) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    setDownloadSuccess(false);
    try {
      const cleanClient = (clientName || "Client").replace(/[^a-zA-Z0-9_-]/g, "_");
      const fileName = `Siwolo_Invoice_${invoiceNumber || "Draft"}_${cleanClient}.pdf`;
      await generatePdf({
        elementId: "invoice-document",
        fileName,
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. You can also use the 'Print' button to save as PDF.");
    } finally {
      setIsExporting(false);
    }
  };

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
            <p className="text-[11px] text-zinc-500 font-medium hidden sm:block">
              Digital Invoice Generation System
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Load Reference Sample Button */}
          <button
            type="button"
            onClick={onLoadSample}
            title="Load sample invoice data from ref.pdf (Chemelil Trustees)"
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 hover:text-zinc-950 border border-zinc-300 rounded-lg transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-zinc-900" />
            <span className="hidden sm:inline">Load Reference Sample</span>
            <span className="sm:hidden">Sample</span>
          </button>

          {/* Reset / New Invoice Button */}
          <button
            type="button"
            onClick={onReset}
            title="Create fresh empty invoice"
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 border border-transparent rounded-lg transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <div className="h-5 w-px bg-zinc-200 hidden sm:block" />

          {/* Print Invoice Button */}
          <button
            type="button"
            onClick={handlePrint}
            title="Print or save as PDF via system dialog"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-300 rounded-lg shadow-xs transition"
          >
            <Printer className="w-3.5 h-3.5 text-zinc-600" />
            <span className="hidden md:inline">Print Invoice</span>
            <span className="md:hidden">Print</span>
          </button>

          {/* Download PDF Button */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg shadow-xs transition ${
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
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
