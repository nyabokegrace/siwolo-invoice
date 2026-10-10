"use client";

import React, { useState } from "react";
import { FirmInfo } from "@/lib/types";
import {
  Building2,
  RotateCcw,
  ShieldCheck,
  Save,
  CheckCircle2,
  Upload,
  X,
} from "lucide-react";
import { saveFirmProfile } from "@/lib/storage";

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
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleSaveAsDefault = () => {
    saveFirmProfile(firm);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Please upload a logo image smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onChangeFirm("logoUrl", dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomLogo = () => {
    onChangeFirm("logoUrl", "");
  };

  return (
    <details className="group bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
      <summary className="flex items-center justify-between p-4 cursor-pointer select-none hover:bg-zinc-50 transition">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-zinc-800" />
          <span className="text-sm font-semibold text-zinc-900">
            Law Firm Profile & Bank Information
          </span>
          <span className="text-[11px] bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border border-zinc-200">
            <ShieldCheck className="w-3 h-3 text-zinc-800" /> {firm.name || "Siwolo P.O."}
          </span>
        </div>
        <span className="text-xs text-zinc-400 group-open:rotate-180 transition-transform">
          ▼
        </span>
      </summary>

      <div className="p-4 sm:p-5 border-t border-zinc-100 bg-zinc-50/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
          <p className="text-xs text-zinc-500">
            Official law firm details branded on the invoice header, payment footer, and share messages.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onResetDefaults}
              className="text-[11px] text-zinc-600 hover:text-black hover:underline flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3 h-3" /> Reset Defaults
            </button>
            <button
              type="button"
              onClick={handleSaveAsDefault}
              className="text-[11px] bg-black hover:bg-zinc-800 text-white px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition shadow-2xs"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Saved as Default!
                </>
              ) : (
                <>
                  <Save className="w-3 h-3" /> Save as Default Profile
                </>
              )}
            </button>
          </div>
        </div>

        {/* Firm Logo Controls */}
        <div className="p-3 bg-white border border-zinc-200 rounded-lg flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded border border-zinc-200 bg-zinc-50 flex items-center justify-center overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={firm.logoUrl || "/logo.jpeg"}
                alt="Firm Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="text-xs font-semibold text-zinc-900 block">
                Firm Header Logo
              </span>
              <span className="text-[11px] text-zinc-500">
                {firm.logoUrl ? "Custom logo uploaded" : "Default Siwolo Law Advocates logo"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium rounded-md border border-zinc-300 transition">
              <Upload className="w-3 h-3" />
              Upload Logo
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </label>
            {firm.logoUrl && (
              <button
                type="button"
                onClick={handleRemoveCustomLogo}
                className="p-1.5 text-zinc-400 hover:text-rose-600 rounded"
                title="Remove custom logo and revert to default"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
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
              className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-900 font-medium"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-700 mb-1">
              Physical Address
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
              Official Phone Number
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
              Payment Details (Paybill, Account, Bank)
            </label>
            <input
              type="text"
              value={firm.paymentDetails}
              onChange={(e) => onChangeFirm("paymentDetails", e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-900 font-mono text-[11px]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-medium text-zinc-700 mb-1">
              Bank Charges Note / Warning Line
            </label>
            <input
              type="text"
              value={firm.bankChargesNote}
              onChange={(e) => onChangeFirm("bankChargesNote", e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-900 uppercase"
            />
          </div>
        </div>
      </div>
    </details>
  );
};
