import { ClientInfo, FirmInfo, InvoiceData, InvoiceItem } from "./types";
import { DEFAULT_FIRM_INFO } from "./defaults";

const STORAGE_KEY_INVOICES = "siwolo_saved_invoices";
const STORAGE_KEY_DRAFT = "siwolo_current_draft";
const STORAGE_KEY_FIRM = "siwolo_firm_profile";
const STORAGE_KEY_CLIENTS = "siwolo_saved_clients";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

// -------------------------------------------------------------
// FIRM PROFILE PERSISTENCE
// -------------------------------------------------------------

export function loadFirmProfile(): FirmInfo {
  if (!isBrowser()) return { ...DEFAULT_FIRM_INFO };
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FIRM);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_FIRM_INFO,
        ...parsed,
      };
    }
  } catch (e) {
    console.error("Failed to load firm profile from storage:", e);
  }
  return { ...DEFAULT_FIRM_INFO };
}

export function saveFirmProfile(firm: FirmInfo): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY_FIRM, JSON.stringify(firm));
    if (typeof fetch !== "undefined") {
      fetch("/api/firm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(firm),
      }).catch(() => {});
    }
  } catch (e) {
    console.error("Failed to save firm profile to storage:", e);
  }
}

// -------------------------------------------------------------
// CLIENT DIRECTORY PERSISTENCE
// -------------------------------------------------------------

export function loadSavedClients(): ClientInfo[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CLIENTS);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        return list;
      }
    }
  } catch (e) {
    console.error("Failed to load clients from storage:", e);
  }
  return [];
}

export function saveClient(client: ClientInfo): void {
  if (!isBrowser() || !client.name?.trim()) return;
  try {
    const clients = loadSavedClients();
    const existingIndex = clients.findIndex(
      (c) =>
        (client.id && c.id === client.id) ||
        c.name.trim().toLowerCase() === client.name.trim().toLowerCase()
    );

    const clientToSave: ClientInfo = {
      ...client,
      id: client.id || `client-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };

    if (existingIndex >= 0) {
      clients[existingIndex] = {
        ...clients[existingIndex],
        ...clientToSave,
      };
    } else {
      clients.unshift(clientToSave);
    }

    localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(clients));
    if (typeof fetch !== "undefined") {
      fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientToSave),
      }).catch(() => {});
    }
  } catch (e) {
    console.error("Failed to save client to storage:", e);
  }
}

export function deleteClient(clientIdOrName: string): void {
  if (!isBrowser()) return;
  try {
    const clients = loadSavedClients().filter(
      (c) => c.id !== clientIdOrName && c.name.toLowerCase() !== clientIdOrName.toLowerCase()
    );
    localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(clients));
  } catch (e) {
    console.error("Failed to delete client from storage:", e);
  }
}

// -------------------------------------------------------------
// INVOICES MANAGEMENT (SAVED INVOICES LEDGER)
// -------------------------------------------------------------

export function loadSavedInvoices(): InvoiceData[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INVOICES);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        return list.sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.invoiceDate || 0).getTime();
          const dateB = new Date(b.updatedAt || b.invoiceDate || 0).getTime();
          return dateB - dateA;
        });
      }
    }
  } catch (e) {
    console.error("Failed to load invoices from storage:", e);
  }
  return [];
}

export function saveInvoiceRecord(invoice: InvoiceData): InvoiceData {
  if (!isBrowser()) return invoice;
  try {
    const invoices = loadSavedInvoices();
    const now = new Date().toISOString();
    const id = invoice.id || `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const recordToSave: InvoiceData = {
      ...invoice,
      id,
      status: invoice.status || "draft",
      createdAt: invoice.createdAt || now,
      updatedAt: now,
    };

    const existingIndex = invoices.findIndex((item) => item.id === id);
    if (existingIndex >= 0) {
      invoices[existingIndex] = recordToSave;
    } else {
      invoices.unshift(recordToSave);
    }

    localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(invoices));

    // Also auto-save/update client in client directory if client has a name
    if (recordToSave.client?.name?.trim()) {
      saveClient(recordToSave.client);
    }

    // Background sync to PostgreSQL database
    if (typeof fetch !== "undefined") {
      fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recordToSave),
      }).catch(() => {});
    }

    return recordToSave;
  } catch (e) {
    console.error("Failed to save invoice record:", e);
    return invoice;
  }
}

export function deleteInvoiceRecord(id: string): void {
  if (!isBrowser()) return;
  try {
    const invoices = loadSavedInvoices().filter((inv) => inv.id !== id);
    localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(invoices));

    if (typeof fetch !== "undefined") {
      fetch(`/api/invoices/${encodeURIComponent(id)}`, {
        method: "DELETE",
      }).catch(() => {});
    }
  } catch (e) {
    console.error("Failed to delete invoice record:", e);
  }
}

export function updateInvoiceStatus(id: string, status: "draft" | "issued" | "paid"): void {
  if (!isBrowser()) return;
  try {
    const invoices = loadSavedInvoices();
    const target = invoices.find((inv) => inv.id === id);
    if (target) {
      target.status = status;
      target.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(invoices));
    }
  } catch (e) {
    console.error("Failed to update invoice status:", e);
  }
}

// -------------------------------------------------------------
// ACTIVE WORKING DRAFT (AUTO-SAVE)
// -------------------------------------------------------------

export function loadCurrentDraft(): InvoiceData | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DRAFT);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to load active draft:", e);
  }
  return null;
}

export function saveCurrentDraft(invoice: InvoiceData): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify(invoice));
  } catch (e) {
    console.error("Failed to auto-save current draft:", e);
  }
}

export function clearCurrentDraft(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(STORAGE_KEY_DRAFT);
  } catch (e) {
    console.error("Failed to clear current draft:", e);
  }
}

// -------------------------------------------------------------
// SEQUENTIAL NUMBERING & NEW INVOICE FACTORY
// -------------------------------------------------------------

export function getNextSequentialInvoiceNumber(): string {
  const invoices = loadSavedInvoices();
  if (invoices.length === 0) {
    return "INV-0001";
  }

  let maxNum = 0;
  let detectedPrefix = "INV-";
  let padLen = 4;

  for (const inv of invoices) {
    const numStr = (inv.invoiceNumber || "").trim();
    const match = numStr.match(/^(.*?)(\d+)$/);
    if (match) {
      detectedPrefix = match[1] || "";
      const val = parseInt(match[2], 10);
      if (val > maxNum) {
        maxNum = val;
        padLen = Math.max(padLen, match[2].length);
      }
    }
  }

  const nextVal = maxNum + 1;
  const padded = nextVal.toString().padStart(padLen, "0");
  return `${detectedPrefix}${padded}`;
}

export function createNewBlankInvoice(firmInfo?: FirmInfo): InvoiceData {
  const firm = firmInfo || loadFirmProfile();
  const today = isBrowser() ? new Date().toISOString().split("T")[0] : "2026-10-09";
  const nowTs = isBrowser() ? Date.now() : 1775730000000;
  const nextNum = getNextSequentialInvoiceNumber();

  const emptyItem: InvoiceItem = {
    id: `item-${nowTs}-1`,
    description: "",
    quantity: 1,
    unitPrice: 0,
  };

  return {
    id: `inv-${nowTs}-${isBrowser() ? Math.random().toString(36).substring(2, 6) : "init"}`,
    invoiceNumber: nextNum,
    invoiceDate: today,
    dueDate: today,
    terms: "Due upon receipt",
    currency: "KES",
    client: {
      name: "",
      addressLine1: "",
      addressLine2: "",
      postalCode: "",
      phone: "",
      email: "",
      customerId: "",
    },
    items: [emptyItem],
    taxRate: 0.0,
    discount: 0,
    notes: firm.defaultNote || "Thank you for your business!",
    firm: firm,
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// -------------------------------------------------------------
// BACKUP IMPORT & EXPORT
// -------------------------------------------------------------

export function exportBackupJson(): string {
  const invoices = loadSavedInvoices();
  const clients = loadSavedClients();
  const firm = loadFirmProfile();

  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    firm,
    clients,
    invoices,
  };

  return JSON.stringify(data, null, 2);
}

export function importBackupJson(jsonString: string): {
  success: boolean;
  message: string;
  invoicesCount?: number;
} {
  if (!isBrowser()) {
    return { success: false, message: "Storage not available in current environment." };
  }

  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== "object") {
      return { success: false, message: "Invalid JSON backup file." };
    }

    if (Array.isArray(data.invoices)) {
      localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(data.invoices));
    }
    if (Array.isArray(data.clients)) {
      localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(data.clients));
    }
    if (data.firm && typeof data.firm === "object") {
      localStorage.setItem(STORAGE_KEY_FIRM, JSON.stringify(data.firm));
    }

    const count = Array.isArray(data.invoices) ? data.invoices.length : 0;
    return {
      success: true,
      message: `Successfully restored ${count} invoices, saved clients, and firm profile.`,
      invoicesCount: count,
    };
  } catch (e: unknown) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Error reading backup file.",
    };
  }
}

// -------------------------------------------------------------
// CLOUD / POSTGRESQL BIDIRECTIONAL SYNC
// -------------------------------------------------------------

export async function syncFromDatabase(): Promise<{
  invoicesCount: number;
  clientsCount: number;
} | null> {
  if (!isBrowser() || typeof fetch === "undefined") return null;
  try {
    const [invRes, cliRes, firmRes] = await Promise.all([
      fetch("/api/invoices").catch(() => null),
      fetch("/api/clients").catch(() => null),
      fetch("/api/firm").catch(() => null),
    ]);

    let invoicesCount = 0;
    let clientsCount = 0;

    if (invRes && invRes.ok) {
      const invJson = await invRes.json();
      if (invJson.success && Array.isArray(invJson.data) && invJson.data.length > 0) {
        localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(invJson.data));
        invoicesCount = invJson.data.length;
      }
    }

    if (cliRes && cliRes.ok) {
      const cliJson = await cliRes.json();
      if (cliJson.success && Array.isArray(cliJson.data) && cliJson.data.length > 0) {
        localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(cliJson.data));
        clientsCount = cliJson.data.length;
      }
    }

    if (firmRes && firmRes.ok) {
      const firmJson = await firmRes.json();
      if (firmJson.success && firmJson.data) {
        localStorage.setItem(STORAGE_KEY_FIRM, JSON.stringify(firmJson.data));
      }
    }

    return { invoicesCount, clientsCount };
  } catch {
    return null;
  }
}
