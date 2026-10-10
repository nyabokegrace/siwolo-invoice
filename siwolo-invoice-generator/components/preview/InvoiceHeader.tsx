import React from "react";
import { FirmInfo } from "@/lib/types";

interface InvoiceHeaderProps {
  firm: FirmInfo;
}

export const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({ firm }) => {
  return (
    <div className="flex items-start justify-between gap-4 pb-6 print-avoid-break">
      {/* Firm Contact Information (Left) */}
      <div className="flex-1 max-w-[55%]">
        <h1 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-2">
          {firm.name}
        </h1>
        <div className="text-xs sm:text-sm text-zinc-700 space-y-0.5 leading-snug">
          <p>{firm.addressLine}</p>
          <p>
            <a
              href={`mailto:${firm.email}`}
              className="text-zinc-800 hover:text-black hover:underline"
            >
              {firm.email}
            </a>
          </p>
          <p>Phone: {firm.phone}</p>
        </div>
      </div>

      {/* Official Siwolo Logo (Center-Right) */}
      <div className="flex items-center justify-center px-2">
        <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={firm.logoUrl || "/logo.jpeg"}
            alt={`${firm.name} Logo`}
            className="w-full h-full object-contain"
            crossOrigin="anonymous"
          />
        </div>
      </div>

      {/* Invoice Title (Far Right) */}
      <div className="text-right flex items-center justify-end min-w-[120px]">
        <h2 className="text-3xl sm:text-4xl font-black text-black tracking-wider uppercase">
          INVOICE
        </h2>
      </div>
    </div>
  );
};
