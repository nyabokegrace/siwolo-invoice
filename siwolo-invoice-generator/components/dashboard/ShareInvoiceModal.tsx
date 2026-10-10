"use client";

import React, { useState } from "react";
import { CalculatedTotals, InvoiceData } from "@/lib/types";
import { formatCurrencyAmount, formatInvoiceDate } from "@/lib/calculations";
import {
  X,
  Share2,
  Mail,
  Copy,
  Check,
  Download,
  ExternalLink,
  MessageCircle,
  FileText,
  Loader2,
  Smartphone,
} from "lucide-react";
import { sharePdfFile, createPdfInstance } from "@/lib/pdf";

interface ShareInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceData;
  totals: CalculatedTotals;
  onDownloadPdf: () => Promise<void>;
  isExporting: boolean;
}

export const ShareInvoiceModal: React.FC<ShareInvoiceModalProps> = ({
  isOpen,
  onClose,
  invoice,
  totals,
  onDownloadPdf,
  isExporting,
}) => {
  const [activeTab, setActiveTab] = useState<"whatsapp" | "email" | "copy" | "files">("whatsapp");
  const [customPhone, setCustomPhone] = useState<string | null>(null);
  const [customEmail, setCustomEmail] = useState<string | null>(null);
  const [copiedState, setCopiedState] = useState<string | null>(null);
  const [isWebSharing, setIsWebSharing] = useState<boolean>(false);

  const phoneOverride = customPhone !== null ? customPhone : (invoice.client.phone || "");
  const emailOverride = customEmail !== null ? customEmail : (invoice.client.email || "");

  if (!isOpen) return null;

  const clientName = invoice.client.name.trim() || "Client";
  const currency = invoice.currency || "KES";
  const formattedTotal = `${currency} ${formatCurrencyAmount(totals.total)}`;
  const invoiceNum = invoice.invoiceNumber || "Draft";
  const cleanFileName = `Siwolo_Invoice_${invoiceNum}_${clientName.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;

  // Format phone number for WhatsApp: convert 07... or 01... to 254...
  const formatWhatsAppPhone = (phone: string): string => {
    const digitsOnly = phone.replace(/\D/g, "");
    if (!digitsOnly) return "";
    if (digitsOnly.startsWith("0") && digitsOnly.length === 10) {
      return `254${digitsOnly.substring(1)}`;
    }
    if (digitsOnly.startsWith("254")) {
      return digitsOnly;
    }
    return digitsOnly;
  };

  const whatsAppPhone = formatWhatsAppPhone(phoneOverride);

  // WhatsApp Message
  const whatsAppMessage = `Dear ${clientName},

Please find the details for Invoice #${invoiceNum} from ${invoice.firm.name}:

• Invoice Number: #${invoiceNum}
• Date: ${formatInvoiceDate(invoice.invoiceDate)}
• Due Date: ${formatInvoiceDate(invoice.dueDate)}
• Total Amount Due: ${formattedTotal}
• Payment Terms: ${invoice.terms || "Due upon receipt"}

PAYMENT INSTRUCTIONS:
${invoice.firm.paymentDetails}
${invoice.firm.bankChargesNote}

The official PDF invoice has been generated. Thank you for your business.`;

  // Email Subject and Body
  const emailSubject = `Invoice #${invoiceNum} - ${invoice.firm.name}`;
  const emailBody = `Dear ${clientName},

Please find below the billing summary for legal services rendered:

Invoice Number: #${invoiceNum}
Issue Date: ${formatInvoiceDate(invoice.invoiceDate)}
Due Date: ${formatInvoiceDate(invoice.dueDate)}
Payment Terms: ${invoice.terms || "Due upon receipt"}

Summary of Charges:
- Subtotal: ${formattedTotal}
${totals.taxRate > 0 ? `- VAT/Tax (${totals.taxRate}%): ${currency} ${formatCurrencyAmount(totals.taxAmount)}\n` : ""}- Total Payable: ${formattedTotal}

PAYMENT DETAILS:
${invoice.firm.paymentDetails}
${invoice.firm.bankChargesNote}

${invoice.notes || "Thank you for your business!"}

Yours faithfully,
${invoice.firm.name}
${invoice.firm.addressLine}
${invoice.firm.phone}
${invoice.firm.email}`;

  // Plain Text Summary
  const plainTextSummary = `=========================================
${invoice.firm.name.toUpperCase()}
INVOICE #${invoiceNum}
=========================================
Client: ${clientName}
Date: ${formatInvoiceDate(invoice.invoiceDate)}
Due Date: ${formatInvoiceDate(invoice.dueDate)}
Terms: ${invoice.terms || "Due upon receipt"}

TOTAL DUE: ${formattedTotal}

Payment Details:
${invoice.firm.paymentDetails}
${invoice.firm.bankChargesNote}
=========================================`;

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedState(label);
      setTimeout(() => setCopiedState(null), 2500);
    } catch {
      // fallback
    }
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(whatsAppMessage);
    const url = whatsAppPhone
      ? `https://wa.me/${whatsAppPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, "_blank");
  };

  const handleOpenEmail = () => {
    const mailto = `mailto:${encodeURIComponent(emailOverride)}?subject=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailto;
  };

  const handleWebShare = async () => {
    setIsWebSharing(true);
    try {
      const { blob } = await createPdfInstance("invoice-document");
      const shared = await sharePdfFile({
        blob,
        fileName: cleanFileName,
        title: `Invoice #${invoiceNum} - ${invoice.firm.name}`,
        text: `Invoice #${invoiceNum} for ${clientName} - Total: ${formattedTotal}`,
      });
      if (shared) {
        onClose();
      }
    } catch (e) {
      console.error("Web share error:", e);
      // Fallback to standard download
      await onDownloadPdf();
    } finally {
      setIsWebSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-950">Share Invoice</h3>
              <p className="text-xs text-zinc-500">
                Invoice #{invoiceNum} • {clientName} • {formattedTotal}
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

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-200 bg-white px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("whatsapp")}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === "whatsapp"
                ? "border-black text-black"
                : "border-transparent text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            WhatsApp
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("email")}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === "email"
                ? "border-black text-black"
                : "border-transparent text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <Mail className="w-4 h-4 text-blue-600" />
            Email
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("files")}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === "files"
                ? "border-black text-black"
                : "border-transparent text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <Download className="w-4 h-4 text-indigo-600" />
            Download & Device Share
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("copy")}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === "copy"
                ? "border-black text-black"
                : "border-transparent text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <FileText className="w-4 h-4 text-zinc-600" />
            Text Summary
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: WHATSAPP */}
          {activeTab === "whatsapp" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Recipient Phone Number
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Smartphone className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                    <input
                      type="text"
                      value={phoneOverride}
                      onChange={(e) => setCustomPhone(e.target.value)}
                      placeholder="e.g. 0792300520 or 254792300520"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenWhatsApp}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Open WhatsApp
                  </button>
                </div>
                {whatsAppPhone && (
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Target WhatsApp number: <span className="font-mono text-zinc-800 font-medium">+{whatsAppPhone}</span>
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-zinc-700">
                    WhatsApp Message Preview
                  </label>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(whatsAppMessage, "whatsapp")}
                    className="text-xs text-zinc-600 hover:text-black flex items-center gap-1 font-medium"
                  >
                    {copiedState === "whatsapp" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Message</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={8}
                  value={whatsAppMessage}
                  className="w-full p-3 text-xs font-mono bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 select-all"
                />
              </div>

              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg p-3 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Download the official PDF to attach alongside your WhatsApp message.</span>
                </div>
                <button
                  type="button"
                  onClick={onDownloadPdf}
                  disabled={isExporting}
                  className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold whitespace-nowrap transition disabled:opacity-60"
                >
                  {isExporting ? "Downloading..." : "Download PDF"}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: EMAIL */}
          {activeTab === "email" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Recipient Email
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={emailOverride}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="e.g. client@example.com"
                    className="flex-1 px-3 py-2 text-sm bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                  />
                  <button
                    type="button"
                    onClick={handleOpenEmail}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
                  >
                    <Mail className="w-4 h-4" />
                    Open Mail App
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  readOnly
                  value={emailSubject}
                  className="w-full px-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-zinc-700">
                    Email Body
                  </label>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(emailBody, "email")}
                    className="text-xs text-zinc-600 hover:text-black flex items-center gap-1 font-medium"
                  >
                    {copiedState === "email" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Email Text</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={7}
                  value={emailBody}
                  className="w-full p-3 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 font-sans leading-relaxed select-all"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-lg p-3 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>Download the PDF to attach to your email client.</span>
                </div>
                <button
                  type="button"
                  onClick={onDownloadPdf}
                  disabled={isExporting}
                  className="px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-semibold whitespace-nowrap transition disabled:opacity-60"
                >
                  {isExporting ? "Downloading..." : "Download PDF"}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: DOWNLOAD & DEVICE SHARE */}
          {activeTab === "files" && (
            <div className="space-y-5">
              <div className="border border-zinc-200 rounded-xl p-4 bg-zinc-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-zinc-900">Direct PDF Download</h4>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    Downloads high-resolution vector A4 invoice directly into your computer or phone&apos;s Downloaded Files.
                  </p>
                  <p className="text-[11px] font-mono text-zinc-500 mt-1">
                    Filename: {cleanFileName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onDownloadPdf}
                  disabled={isExporting}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg shadow-sm transition whitespace-nowrap disabled:opacity-60"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download to Files</span>
                    </>
                  )}
                </button>
              </div>

              {/* Native Device Share */}
              <div className="border border-zinc-200 rounded-xl p-4 bg-zinc-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                    <Share2 className="w-4 h-4 text-zinc-700" />
                    Share via System Dialog
                  </h4>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    Share directly using your device&apos;s native share sheet (AirDrop, WhatsApp, Mail, Telegram, Drive).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleWebShare}
                  disabled={isWebSharing || isExporting}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-black text-white text-xs font-semibold rounded-lg shadow-sm transition whitespace-nowrap disabled:opacity-60"
                >
                  {isWebSharing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Preparing...</span>
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      <span>Open Share Sheet</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: TEXT SUMMARY */}
          {activeTab === "copy" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-700">
                  Formatted Invoice Summary (for SMS, Chat, or Records):
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(plainTextSummary, "summary")}
                  className="text-xs text-zinc-800 hover:text-black flex items-center gap-1 font-semibold"
                >
                  {copiedState === "summary" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy to Clipboard</span>
                    </>
                  )}
                </button>
              </div>
              <textarea
                readOnly
                rows={11}
                value={plainTextSummary}
                className="w-full p-3 text-xs font-mono bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 select-all"
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <span className="text-xs text-zinc-500">
            Siwolo P.O. Law Advocates • Document Delivery
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-zinc-700 hover:text-zinc-950 bg-white border border-zinc-300 rounded-lg shadow-xs hover:bg-zinc-100 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
