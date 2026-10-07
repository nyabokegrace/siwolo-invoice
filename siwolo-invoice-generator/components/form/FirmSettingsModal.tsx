import React from "react";
import { FirmInfo } from "@/lib/types";
import { Building2, RotateCcw, ShieldCheck } from "lucide-react";

interface FirmSettingsProps {
  firm: FirmInfo;
  onChangeFirm: (field: keyof FirmInfo, value: string) => void;
  onResetDefaults: () => void;
}

export const FirmSettingsSection: React.FC<FirmSettingsProps> = ({
  firm,
  onChangeFirm,
  onResetDefaults,
}) => {
  return (
    <details className="group bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
      <summary className="flex items-center justify-between p-4 cursor-pointer select-none hover:bg-zinc-50 transition">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-zinc-800" />
          <span className="text-sm font-semibold text-zinc-900">
            Law Firm Profile & Bank Information
          </span>
          <span className="text-[11px] bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border border-zinc-200">
            <ShieldCheck className="w-3 h-3 text-zinc-800" /> Siwolo P.O.
          </span>
        </div>
        <span className="text-xs text-zinc-400 group-open:rotate-180 transition-transform">
          ▼
        </span>
      </summary>

      <div className="p-4 sm:p-5 border-t border-zinc-100 bg-zinc-50/50 space-y-4">
        <div className="flex justify-between items-center mb-1">
          <p className="text-xs text-zinc-500">
            Official details branded on the invoice header and payment footer.
          </p>
          <button
            type="button"
            onClick={onResetDefaults}
            className="text-[11px] text-zinc-800 hover:text-black hover:underline flex items-center gap-1 font-medium"
          >
            <RotateCcw className="w-3 h-3" /> Reset to Siwolo Defaults
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-medium text-zinc-700 mb-1">
              Firm Name
            </label>
            <input
              type="text"
              value={firm.name}
              onChange={(e) => onChangeFirm("name", e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-700 mb-1">
              Address
            </label>
            <input
              type="text"
              value={firm.addressLine}
              onChange={(e) => onChangeFirm("addressLine", e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-700 mb-1">
              Firm Email
            </label>
            <input
              type="email"
              value={firm.email}
              onChange={(e) => onChangeFirm("email", e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-700 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={firm.phone}
              onChange={(e) => onChangeFirm("phone", e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-medium text-zinc-700 mb-1">
              Payment & Bank Details Line
            </label>
            <input
              type="text"
              value={firm.paymentDetails}
              onChange={(e) => onChangeFirm("paymentDetails", e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-medium text-zinc-700 mb-1">
              Bank Charges Warning Note
            </label>
            <input
              type="text"
              value={firm.bankChargesNote}
              onChange={(e) => onChangeFirm("bankChargesNote", e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>
        </div>
      </div>
    </details>
  );
};
