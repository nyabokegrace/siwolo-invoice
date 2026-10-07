"use client";

import React, { useState } from "react";
import { TopNav } from "@/components/dashboard/TopNav";
import { SummaryBar } from "@/components/dashboard/SummaryBar";
import { InvoiceForm } from "@/components/form/InvoiceForm";
import { InvoicePreview } from "@/components/preview/InvoicePreview";
import { ClientInfo, FirmInfo, InvoiceData, InvoiceItem } from "@/lib/types";
import {
  DEFAULT_FIRM_INFO,
  INITIAL_EMPTY_INVOICE,
  REFERENCE_SAMPLE_INVOICE,
} from "@/lib/defaults";
import { calculateInvoiceTotals } from "@/lib/calculations";

export default function InvoiceDashboard() {
  // Initialize with reference sample invoice for instant visual fidelity verification
  const [invoice, setInvoice] = useState<InvoiceData>(REFERENCE_SAMPLE_INVOICE);
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");

  // Derive calculated totals automatically
  const totals = calculateInvoiceTotals(invoice);

  // Field updates
  const handleUpdateInvoiceField = (field: string, value: string | number) => {
    setInvoice((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdateClient = (field: keyof ClientInfo, value: string) => {
    setInvoice((prev) => ({
      ...prev,
      client: {
        ...prev.client,
        [field]: value,
      },
    }));
  };

  const handleUpdateFirm = (field: keyof FirmInfo, value: string) => {
    setInvoice((prev) => ({
      ...prev,
      firm: {
        ...prev.firm,
        [field]: value,
      },
    }));
  };

  const handleResetFirmDefaults = () => {
    setInvoice((prev) => ({
      ...prev,
      firm: { ...DEFAULT_FIRM_INFO },
    }));
  };

  // Line item handlers
  const handleAddItem = (presetDescription?: string) => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      description: presetDescription || "Legal Service & Consultation",
      quantity: 1,
      unitPrice: 5000,
    };
    setInvoice((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const handleUpdateItem = (
    id: string,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleRemoveItem = (id: string) => {
    if (invoice.items.length <= 1) return;
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const handleDuplicateItem = (id: string) => {
    const itemToDup = invoice.items.find((item) => item.id === id);
    if (!itemToDup) return;
    const duplicated: InvoiceItem = {
      ...itemToDup,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      description: `${itemToDup.description} (Copy)`,
    };
    setInvoice((prev) => ({
      ...prev,
      items: [...prev.items, duplicated],
    }));
  };

  // Toolbar actions
  const handleLoadSample = () => {
    setInvoice(JSON.parse(JSON.stringify(REFERENCE_SAMPLE_INVOICE)));
  };

  const handleReset = () => {
    setInvoice(JSON.parse(JSON.stringify(INITIAL_EMPTY_INVOICE)));
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-100">
      {/* Top Navigation */}
      <TopNav
        invoiceNumber={invoice.invoiceNumber}
        clientName={invoice.client.name}
        onLoadSample={handleLoadSample}
        onReset={handleReset}
      />

      {/* Summary Stats & Mobile Tab Switcher */}
      <SummaryBar
        invoiceNumber={invoice.invoiceNumber}
        clientName={invoice.client.name}
        itemCount={invoice.items.length}
        totals={totals}
        currency={invoice.currency}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Form Editor */}
          <div
            className={`lg:col-span-6 xl:col-span-5 print-hide ${
              activeTab === "editor" ? "block" : "hidden lg:block"
            }`}
          >
            <div className="no-print">
              <InvoiceForm
                invoice={invoice}
                totals={totals}
                onUpdateInvoiceField={handleUpdateInvoiceField}
                onUpdateClient={handleUpdateClient}
                onAddItem={handleAddItem}
                onUpdateItem={handleUpdateItem}
                onRemoveItem={handleRemoveItem}
                onDuplicateItem={handleDuplicateItem}
                onUpdateFirm={handleUpdateFirm}
                onResetFirmDefaults={handleResetFirmDefaults}
              />
            </div>
          </div>

          {/* Right Column: Live Invoice Preview */}
          <div
            className={`lg:col-span-6 xl:col-span-7 print-show ${
              activeTab === "preview" ? "block" : "hidden lg:block"
            } lg:sticky lg:top-20`}
          >
            <div className="h-[calc(100vh-140px)] min-h-[650px] flex flex-col print-show">
              <InvoicePreview invoice={invoice} totals={totals} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
