"use client";

import React, { useState, useEffect, useRef } from "react";
import { CalculatedTotals, InvoiceData } from "@/lib/types";
import { InvoiceHeader } from "./InvoiceHeader";
import { InvoiceMetaSection } from "./InvoiceMetaSection";
import { InvoiceTable } from "./InvoiceTable";
import { InvoiceTotals } from "./InvoiceTotals";
import { InvoiceFooter } from "./InvoiceFooter";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface InvoicePreviewProps {
  invoice: InvoiceData;
  totals: CalculatedTotals;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  invoice,
  totals,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(85);
  const [isAutoFit, setIsAutoFit] = useState<boolean>(true);

  // Auto-calculate best fit scale based on container width
  useEffect(() => {
    const updateFit = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      if (width > 0) {
        // A4 document is ~794px wide (210mm)
        // Allow 32px padding
        const calculated = Math.min(100, Math.max(45, Math.floor(((width - 48) / 794) * 100)));
        if (isAutoFit) {
          setZoomLevel(calculated);
        }
      }
    };

    updateFit();
    window.addEventListener("resize", updateFit);
    return () => window.removeEventListener("resize", updateFit);
  }, [isAutoFit]);

  const handleZoomIn = () => {
    setIsAutoFit(false);
    setZoomLevel((prev) => Math.min(prev + 10, 140));
  };

  const handleZoomOut = () => {
    setIsAutoFit(false);
    setZoomLevel((prev) => Math.max(prev - 10, 50));
  };

  const handleFit = () => {
    setIsAutoFit(true);
    if (containerRef.current) {
      const width = containerRef.current.clientWidth;
      const calculated = Math.min(100, Math.max(45, Math.floor(((width - 48) / 794) * 100)));
      setZoomLevel(calculated);
    }
  };

  const handleActualSize = () => {
    setIsAutoFit(false);
    setZoomLevel(100);
  };

  const scaleValue = zoomLevel / 100;

  return (
    <div className="flex flex-col h-full bg-slate-200/80 rounded-xl border border-slate-300 shadow-inner overflow-hidden print:bg-transparent print:border-none print:shadow-none print:h-auto print:overflow-visible">
      {/* Preview Toolbar */}
      <div className="no-print flex items-center justify-between px-4 py-2.5 bg-slate-100 border-b border-slate-300 text-xs text-slate-700 select-none">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800">Document Preview</span>
          <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
            A4 Standard
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1 hover:bg-slate-200 rounded text-slate-600 transition"
            title="Zoom Out"
            aria-label="Zoom out preview"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="font-mono text-[11px] text-slate-700 min-w-[36px] text-center">
            {zoomLevel}%
          </span>

          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1 hover:bg-slate-200 rounded text-slate-600 transition"
            title="Zoom In"
            aria-label="Zoom in preview"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <div className="h-3 w-px bg-slate-300 mx-0.5" />

          <button
            type="button"
            onClick={handleFit}
            className={`px-2 py-0.5 text-[11px] font-medium rounded transition flex items-center gap-1 ${
              isAutoFit
                ? "bg-black text-white"
                : "bg-slate-200 hover:bg-slate-300 text-slate-700"
            }`}
            title="Fit to Preview Width"
          >
            <Maximize2 className="w-3 h-3" />
            Fit
          </button>

          <button
            type="button"
            onClick={handleActualSize}
            className={`px-2 py-0.5 text-[11px] font-medium rounded transition ${
              zoomLevel === 100 && !isAutoFit
                ? "bg-black text-white"
                : "bg-slate-200 hover:bg-slate-300 text-slate-700"
            }`}
            title="100% Actual Size"
          >
            100%
          </button>
        </div>
      </div>

      {/* Scrollable Preview Area */}
      <div
        ref={containerRef}
        id="invoice-preview-container"
        className="flex-1 overflow-auto p-4 sm:p-6 flex justify-center items-start bg-slate-300/40"
      >
        {/* Scaled Wrapper: sizes outer area based on transformed dimensions to allow proper scroll */}
        <div
          style={{
            width: `${794 * scaleValue}px`,
            minHeight: `${1123 * scaleValue}px`,
            transition: "width 0.15s ease-out, min-height 0.15s ease-out",
          }}
          className="relative print-reset-scale"
        >
          {/* Transform Container */}
          <div
            style={{
              transform: `scale(${scaleValue})`,
              transformOrigin: "top left",
              width: "794px",
              minHeight: "1123px",
              transition: "transform 0.15s ease-out",
            }}
            className="print-reset-scale"
          >
            {/* THE EXACT A4 INVOICE DOCUMENT */}
            <div
              id="invoice-document"
              className="w-[794px] min-h-[1123px] bg-white text-slate-900 shadow-xl p-12 flex flex-col justify-between font-sans relative box-border"
              style={{
                fontFamily: "Arial, 'Helvetica Neue', Helvetica, sans-serif",
              }}
            >
              {/* Top & Middle Content */}
              <div>
                {/* Header: Firm Details + Logo + INVOICE */}
                <InvoiceHeader firm={invoice.firm} />

                {/* Meta: BILL TO Banner + 2x2 Meta Grid */}
                <InvoiceMetaSection
                  client={invoice.client}
                  invoiceNumber={invoice.invoiceNumber}
                  invoiceDate={invoice.invoiceDate}
                  terms={invoice.terms}
                />

                {/* Items Table */}
                <InvoiceTable
                  items={invoice.items}
                  currency={invoice.currency}
                  minLedgerRows={10}
                />

                {/* Totals & Notes */}
                <InvoiceTotals
                  totals={totals}
                  currency={invoice.currency}
                  notes={invoice.notes}
                />
              </div>

              {/* Bottom Footer (Payment Details & Red Warning) */}
              <div>
                <InvoiceFooter firm={invoice.firm} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
