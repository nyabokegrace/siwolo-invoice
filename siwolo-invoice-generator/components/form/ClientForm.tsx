import React from "react";
import { ClientInfo } from "@/lib/types";
import { User, Users, X } from "lucide-react";

interface ClientFormProps {
  client: ClientInfo;
  savedClients?: ClientInfo[];
  onChange: (field: keyof ClientInfo, value: string) => void;
  onSelectClient?: (selected: ClientInfo) => void;
  onClearClient?: () => void;
}

export const ClientForm: React.FC<ClientFormProps> = ({
  client,
  savedClients = [],
  onChange,
  onSelectClient,
  onClearClient,
}) => {
  const handleChooseClient = (clientName: string) => {
    if (!clientName) return;
    const match = savedClients.find(
      (c) => c.name.toLowerCase() === clientName.toLowerCase()
    );
    if (match) {
      if (onSelectClient) {
        onSelectClient(match);
      } else {
        onChange("name", match.name);
        onChange("addressLine1", match.addressLine1 || "");
        onChange("addressLine2", match.addressLine2 || "");
        onChange("postalCode", match.postalCode || "");
        onChange("phone", match.phone || "");
        onChange("email", match.email || "");
        onChange("customerId", match.customerId || "");
      }
    }
  };

  const handleClear = () => {
    if (onClearClient) {
      onClearClient();
    } else {
      onChange("name", "");
      onChange("addressLine1", "");
      onChange("addressLine2", "");
      onChange("postalCode", "");
      onChange("phone", "");
      onChange("email", "");
      onChange("customerId", "");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-xs p-4 sm:p-5">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-100">
        <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
          <User className="w-4 h-4 text-zinc-800" />
          Client Information (BILL TO)
        </h3>
        <div className="flex items-center gap-2">
          {client.name && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] text-zinc-500 hover:text-zinc-800 flex items-center gap-1 transition"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
          <span className="text-xs text-zinc-500">Recipient Details</span>
        </div>
      </div>

      {/* Saved Clients Quick Picker */}
      {savedClients.length > 0 && (
        <div className="mb-4 p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-zinc-700 flex items-center gap-1">
              <Users className="w-3 h-3 text-zinc-600" />
              Autofill from Saved Clients ({savedClients.length}):
            </span>
          </div>
          <select
            value=""
            onChange={(e) => handleChooseClient(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-zinc-300 rounded-md text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          >
            <option value="">-- Choose a past client to autofill --</option>
            {savedClients.map((c) => (
              <option key={c.id || c.name} value={c.name}>
                {c.name} {c.customerId ? `(PIN: ${c.customerId})` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

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
            placeholder="e.g. Chemelil Sugar Educational Trustees or John Doe"
            className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition font-medium"
            required
          />
        </div>

        {/* Customer ID / Reference */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1">
            Customer ID / Matter Ref / KRA PIN
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
            Phone Number (for WhatsApp / SMS)
          </label>
          <input
            type="text"
            value={client.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="e.g. 0792300520 or 254792300520"
            className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition font-mono"
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
            placeholder="e.g. Mbandu Complex, Langata Road"
            className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition"
          />
        </div>

        {/* Address Line 2 */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1">
            City / District / Area (Line 2)
          </label>
          <input
            type="text"
            value={client.addressLine2}
            onChange={(e) => onChange("addressLine2", e.target.value)}
            placeholder="e.g. Nairobi, Kenya"
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
            Email Address (for Digital Invoicing)
          </label>
          <input
            type="email"
            value={client.email || ""}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="e.g. client@domain.com"
            className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition"
          />
        </div>
      </div>
    </div>
  );
};
