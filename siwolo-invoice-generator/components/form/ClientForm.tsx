import React from "react";
import { ClientInfo } from "@/lib/types";
import { User } from "lucide-react";

interface ClientFormProps {
  client: ClientInfo;
  onChange: (field: keyof ClientInfo, value: string) => void;
}

export const ClientForm: React.FC<ClientFormProps> = ({ client, onChange }) => {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-xs p-4 sm:p-5">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-100">
        <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
          <User className="w-4 h-4 text-zinc-800" />
          Client Information (BILL TO)
        </h3>
        <span className="text-xs text-zinc-500">Recipient Details</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Client Name */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-zinc-700 mb-1">
            Client / Organisation Name <span className="text-zinc-900 font-bold">*</span>
          </label>
          <input
            type="text"
            value={client.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="e.g. The Chemelil Sugar Educational Trustees"
            className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition font-medium"
            required
          />
        </div>

        {/* Customer ID / Reference */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1">
            Customer ID / Matter Ref / PIN
          </label>
          <input
            type="text"
            value={client.customerId}
            onChange={(e) => onChange("customerId", e.target.value)}
            placeholder="e.g. P052535598Z"
            className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition font-mono"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1">
            Phone Number
          </label>
          <input
            type="text"
            value={client.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="e.g. 25421759867"
            className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition"
          />
        </div>

        {/* Address Line 1 */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1">
            Address / Location (Line 1)
          </label>
          <input
            type="text"
            value={client.addressLine1}
            onChange={(e) => onChange("addressLine1", e.target.value)}
            placeholder="e.g. Chemelil"
            className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition"
          />
        </div>

        {/* Address Line 2 */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1">
            City / District (Line 2)
          </label>
          <input
            type="text"
            value={client.addressLine2}
            onChange={(e) => onChange("addressLine2", e.target.value)}
            placeholder="e.g. Muhoroni"
            className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition"
          />
        </div>

        {/* Postal Code / Box */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1">
            Postal Code / P.O. Box
          </label>
          <input
            type="text"
            value={client.postalCode}
            onChange={(e) => onChange("postalCode", e.target.value)}
            placeholder="e.g. 117 - 40107"
            className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1">
            Email Address (Optional)
          </label>
          <input
            type="email"
            value={client.email || ""}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="e.g. legal@client.org"
            className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition"
          />
        </div>
      </div>
    </div>
  );
};
