import React from "react";
import { ClientInfo } from "@/lib/types";
import { formatInvoiceDate } from "@/lib/calculations";

interface InvoiceMetaSectionProps {
  client: ClientInfo;
  invoiceNumber: string;
  invoiceDate: string;
  terms: string;
}

export const InvoiceMetaSection: React.FC<InvoiceMetaSectionProps> = ({
  client,
  invoiceNumber,
  invoiceDate,
  terms,
}) => {
  return (
    <div className="flex flex-row justify-between items-start gap-6 my-5 print-avoid-break">
      {/* BILL TO (Left Column) */}
      <div className="w-[58%] flex flex-col">
        <div className="bg-black text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5">
          BILL TO
        </div>
        <div className="text-xs sm:text-[13px] text-zinc-900 pt-2 space-y-0.5 leading-snug">
          {client.name ? (
            <p className="font-semibold text-black">{client.name}</p>
          ) : (
            <p className="text-zinc-400 italic">Client Name / Organisation</p>
          )}
          {client.addressLine1 && <p>{client.addressLine1}</p>}
          {client.addressLine2 && <p>{client.addressLine2}</p>}
          {client.postalCode && <p>{client.postalCode}</p>}
          {client.phone && <p>{client.phone}</p>}
          {client.email && <p className="text-zinc-600">{client.email}</p>}
        </div>
      </div>

      {/* METADATA GRID (Right Column) */}
      <div className="w-[38%] flex flex-col justify-start">
        <div className="grid grid-cols-2 gap-x-2 gap-y-2.5">
          {/* Row 1: INVOICE # & DATE */}
          <div>
            <div className="bg-black text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2 py-1 text-center truncate">
              INVOICE #
            </div>
            <div className="text-xs sm:text-sm font-semibold text-center py-1 text-zinc-900 border-b border-zinc-200">
              {invoiceNumber || "—"}
            </div>
          </div>

          <div>
            <div className="bg-black text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2 py-1 text-center truncate">
              DATE
            </div>
            <div className="text-xs sm:text-sm text-center py-1 text-zinc-900 border-b border-zinc-200">
              {formatInvoiceDate(invoiceDate) || "—"}
            </div>
          </div>

          {/* Row 2: CUSTOMER ID & TERMS */}
          <div>
            <div className="bg-black text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-1.5 py-1 text-center truncate">
              CUSTOMER ID
            </div>
            <div className="text-xs sm:text-sm text-center py-1 text-zinc-900 border-b border-zinc-200 truncate">
              {client.customerId || "—"}
            </div>
          </div>

          <div>
            <div className="bg-black text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2 py-1 text-center truncate">
              TERMS
            </div>
            <div className="text-xs sm:text-sm text-center py-1 text-zinc-900 border-b border-zinc-200 truncate">
              {terms || "Due upon receipt"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
