"use client";

import React from "react";
import { CalculatedTotals, ClientInfo, FirmInfo, InvoiceData, InvoiceItem } from "@/lib/types";
import { InvoiceDetailsForm } from "./InvoiceDetailsForm";
import { ClientForm } from "./ClientForm";
import { InvoiceItemsForm } from "./InvoiceItemsForm";
import { AdjustmentsForm } from "./AdjustmentsForm";
import { FirmSettingsSection } from "./FirmSettingsModal";
import { AlertCircle } from "lucide-react";

interface InvoiceFormProps {
  invoice: InvoiceData;
  totals: CalculatedTotals;
  savedClients?: ClientInfo[];
  onUpdateInvoiceField: (field: string, value: string | number) => void;
  onUpdateClient: (field: keyof ClientInfo, value: string) => void;
  onSelectClient?: (client: ClientInfo) => void;
  onClearClient?: () => void;
  onAddItem: (presetDescription?: string) => void;
  onUpdateItem: (id: string, field: keyof InvoiceItem, value: string | number) => void;
  onRemoveItem: (id: string) => void;
  onDuplicateItem: (id: string) => void;
  onUpdateFirm: (field: keyof FirmInfo, value: string) => void;
  onResetFirmDefaults: () => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  invoice,
  totals,
  savedClients = [],
  onUpdateInvoiceField,
  onUpdateClient,
  onSelectClient,
  onClearClient,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onDuplicateItem,
  onUpdateFirm,
  onResetFirmDefaults,
}) => {
  const isClientNameMissing = !invoice.client.name.trim();
  const isInvoiceNumberMissing = !invoice.invoiceNumber.trim();

  return (
    <div className="space-y-6">
      {/* Validation Banner if missing required fields */}
      {(isClientNameMissing || isInvoiceNumberMissing) && (
        <div className="bg-zinc-100 border border-zinc-300 text-zinc-900 rounded-lg p-3 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-zinc-700 shrink-0" />
          <div>
            <span className="font-semibold">Pending Information:</span>{" "}
            {isInvoiceNumberMissing && "Please enter an invoice number. "}
            {isClientNameMissing && "Please enter the client / organization name."}
          </div>
        </div>
      )}

      {/* Invoice Meta Details */}
      <InvoiceDetailsForm
        invoiceNumber={invoice.invoiceNumber}
        invoiceDate={invoice.invoiceDate}
        terms={invoice.terms}
        currency={invoice.currency}
        onChange={onUpdateInvoiceField}
      />

      {/* Client Information */}
      <ClientForm
        client={invoice.client}
        savedClients={savedClients}
        onChange={onUpdateClient}
        onSelectClient={onSelectClient}
        onClearClient={onClearClient}
      />

      {/* Invoice Line Items */}
      <InvoiceItemsForm
        items={invoice.items}
        currency={invoice.currency}
        onAddItem={onAddItem}
        onUpdateItem={onUpdateItem}
        onRemoveItem={onRemoveItem}
        onDuplicateItem={onDuplicateItem}
      />

      {/* Adjustments & Totals */}
      <AdjustmentsForm
        totals={totals}
        taxRate={invoice.taxRate}
        discount={invoice.discount}
        notes={invoice.notes}
        currency={invoice.currency}
        onChangeField={onUpdateInvoiceField}
      />

      {/* Firm Profile & Banking Info Settings */}
      <FirmSettingsSection
        firm={invoice.firm}
        onChangeFirm={onUpdateFirm}
        onResetDefaults={onResetFirmDefaults}
      />
    </div>
  );
};
