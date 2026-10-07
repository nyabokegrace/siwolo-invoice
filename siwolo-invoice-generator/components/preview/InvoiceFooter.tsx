import React from "react";
import { FirmInfo } from "@/lib/types";

interface InvoiceFooterProps {
  firm: FirmInfo;
}

export const InvoiceFooter: React.FC<InvoiceFooterProps> = ({ firm }) => {
  return (
    <div className="mt-8 pt-4 text-center space-y-1.5 print-avoid-break">
      {/* Payment details line */}
      <p className="text-xs sm:text-[13px] font-bold text-black tracking-tight">
        {firm.paymentDetails}
      </p>

      {/* Bank charges note line */}
      <p className="text-xs sm:text-[12px] font-bold text-zinc-800 tracking-wider uppercase">
        {firm.bankChargesNote}
      </p>
    </div>
  );
};
