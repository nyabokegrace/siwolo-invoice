"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { TopNav } from "@/components/dashboard/TopNav";
import { SummaryBar } from "@/components/dashboard/SummaryBar";
import { InvoiceForm } from "@/components/form/InvoiceForm";
import { InvoicePreview } from "@/components/preview/InvoicePreview";
import { ShareInvoiceModal } from "@/components/dashboard/ShareInvoiceModal";
import { SavedInvoicesModal } from "@/components/dashboard/SavedInvoicesModal";
import { ClientInfo, FirmInfo, InvoiceData, InvoiceItem, InvoiceStatus } from "@/lib/types";
import {
  REFERENCE_SAMPLE_INVOICE,
  DEFAULT_FIRM_INFO,
  INITIAL_EMPTY_INVOICE,
} from "@/lib/defaults";
import { calculateInvoiceTotals } from "@/lib/calculations";
import {
  loadSavedInvoices,
  loadSavedClients,
  saveInvoiceRecord,
  deleteInvoiceRecord,
  loadCurrentDraft,
  saveCurrentDraft,
  createNewBlankInvoice,
  loadFirmProfile,
  getNextSequentialInvoiceNumber,
  syncFromDatabase,
} from "@/lib/storage";
import { generatePdf } from "@/lib/pdf";

export default function InvoiceDashboard() {
  // Initialize with deterministic empty invoice for prerendering
  const [invoice, setInvoice] = useState<InvoiceData>(INITIAL_EMPTY_INVOICE);

  const [savedInvoices, setSavedInvoices] = useState<InvoiceData[]>([]);
  const [savedClients, setSavedClients] = useState<ClientInfo[]>([]);
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const [isSavedModalOpen, setIsSavedModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isAutoSaved, setIsAutoSaved] = useState<boolean>(false);

  // Auto-save debounce ref
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // On mount: asynchronously load persistent draft, firm profile, and saved invoices
  useEffect(() => {
    const timer = setTimeout(() => {
      const list = loadSavedInvoices();
      setSavedInvoices(list);
      setSavedClients(loadSavedClients());

      const draft = loadCurrentDraft();
      if (draft && draft.invoiceNumber) {
        setInvoice(draft);
      } else {
        const firm = loadFirmProfile();
        setInvoice(createNewBlankInvoice(firm));
      }

      // Check and sync from PostgreSQL if available
      syncFromDatabase().then((res) => {
        if (res && res.invoicesCount > 0) {
          setSavedInvoices(loadSavedInvoices());
          setSavedClients(loadSavedClients());
        }
      });
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Reload saved invoices & clients list helper
  const reloadSavedInvoices = useCallback(() => {
    setSavedInvoices(loadSavedInvoices());
    setSavedClients(loadSavedClients());
  }, []);

  // Derive calculated totals automatically
  const totals = calculateInvoiceTotals(invoice);

  // Auto-save current working draft whenever invoice changes
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(() => {
      saveCurrentDraft(invoice);
      setIsAutoSaved(true);
      setTimeout(() => setIsAutoSaved(false), 2000);
    }, 600);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [invoice]);

  // Field updates
  const handleUpdateInvoiceField = (field: string, value: string | number) => {
    setIsSaved(false);
    setInvoice((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdateClient = (field: keyof ClientInfo, value: string) => {
    setIsSaved(false);
    setInvoice((prev) => ({
      ...prev,
      client: {
        ...prev.client,
        [field]: value,
      },
    }));
  };

  const handleSelectClient = (client: ClientInfo) => {
    setIsSaved(false);
    setInvoice((prev) => ({
      ...prev,
      client: { ...client },
    }));
  };

  const handleClearClient = () => {
    setInvoice((prev) => ({
      ...prev,
      client: {
        name: "",
        addressLine1: "",
        addressLine2: "",
        postalCode: "",
        phone: "",
        email: "",
        customerId: "",
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
      description: presetDescription || "",
      quantity: 1,
      unitPrice: presetDescription ? 5000 : 0,
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

  // Status handler
  const handleStatusChange = (status: InvoiceStatus) => {
    setInvoice((prev) => ({
      ...prev,
      status,
    }));
  };

  // Save invoice record to permanent ledger
  const handleSaveInvoice = () => {
    const saved = saveInvoiceRecord(invoice);
    setInvoice(saved);
    reloadSavedInvoices();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Create new blank invoice
  const handleNewInvoice = () => {
    const firm = loadFirmProfile();
    const fresh = createNewBlankInvoice(firm);
    setInvoice(fresh);
    saveCurrentDraft(fresh);
    setIsSaved(false);
  };

  // Duplicate an invoice
  const handleDuplicateInvoice = (targetInvoice: InvoiceData) => {
    const nextNum = getNextSequentialInvoiceNumber();
    const duplicated: InvoiceData = {
      ...JSON.parse(JSON.stringify(targetInvoice)),
      id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      invoiceNumber: nextNum,
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: new Date().toISOString().split("T")[0],
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setInvoice(duplicated);
    saveCurrentDraft(duplicated);
  };

  // Delete invoice
  const handleDeleteInvoice = (id: string) => {
    deleteInvoiceRecord(id);
    reloadSavedInvoices();
    if (invoice.id === id) {
      handleNewInvoice();
    }
  };

  // Load an invoice from ledger
  const handleSelectInvoice = (selected: InvoiceData) => {
    setInvoice(JSON.parse(JSON.stringify(selected)));
    saveCurrentDraft(selected);
  };

  // Load reference sample (Chemelil Trustees demo)
  const handleLoadSample = () => {
    const sample = JSON.parse(JSON.stringify(REFERENCE_SAMPLE_INVOICE));
    setInvoice(sample);
    saveCurrentDraft(sample);
  };

  // PDF Export Directly to Downloads folder
  const handleDownloadPdf = async () => {
    setIsExporting(true);
    setDownloadSuccess(false);
    try {
      const cleanClient = (invoice.client.name || "Client").replace(
        /[^a-zA-Z0-9_-]/g,
        "_"
      );
      const fileName = `Siwolo_Invoice_${invoice.invoiceNumber || "Draft"}_${cleanClient}.pdf`;
      await generatePdf({
        elementId: "invoice-document",
        fileName,
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);

      // Auto-mark as issued if it was draft
      if (invoice.status === "draft") {
        setInvoice((prev) => ({ ...prev, status: "issued" }));
      }
    } catch (err) {
      console.error("PDF download failed:", err);
      alert(
        "PDF generation encountered an issue. You can also use the 'Print' button to save directly as PDF."
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-100">
      {/* Top Navigation */}
      <TopNav
        invoiceNumber={invoice.invoiceNumber}
        clientName={invoice.client.name}
        savedInvoicesCount={savedInvoices.length}
        isSaved={isSaved}
        onSaveInvoice={handleSaveInvoice}
        onOpenInvoicesList={() => setIsSavedModalOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onNewInvoice={handleNewInvoice}
        onLoadSample={handleLoadSample}
        onDownloadPdf={handleDownloadPdf}
        isExporting={isExporting}
        downloadSuccess={downloadSuccess}
      />

      {/* Summary Stats, Status Badge & Mobile Tab Switcher */}
      <SummaryBar
        invoiceNumber={invoice.invoiceNumber}
        clientName={invoice.client.name}
        itemCount={invoice.items.length}
        totals={totals}
        currency={invoice.currency}
        status={invoice.status}
        onStatusChange={handleStatusChange}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAutoSaved={isAutoSaved}
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
                savedClients={savedClients}
                onUpdateInvoiceField={handleUpdateInvoiceField}
                onUpdateClient={handleUpdateClient}
                onSelectClient={handleSelectClient}
                onClearClient={handleClearClient}
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

      {/* Modal: Saved Invoices & Ledger */}
      <SavedInvoicesModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        invoices={savedInvoices}
        onSelectInvoice={handleSelectInvoice}
        onNewInvoice={handleNewInvoice}
        onDuplicateInvoice={handleDuplicateInvoice}
        onDeleteInvoice={handleDeleteInvoice}
        onReloadInvoices={reloadSavedInvoices}
        currentInvoiceId={invoice.id}
      />

      {/* Modal: Share to Clients (WhatsApp, Email, Device Share, Download) */}
      <ShareInvoiceModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        invoice={invoice}
        totals={totals}
        onDownloadPdf={handleDownloadPdf}
        isExporting={isExporting}
      />
    </div>
  );
}
