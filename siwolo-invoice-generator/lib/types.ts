export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface ClientInfo {
  name: string;
  addressLine1: string;
  addressLine2: string;
  postalCode: string;
  phone: string;
  email?: string;
  customerId: string; // e.g. Customer ID or KRA PIN
}

export interface FirmInfo {
  name: string;
  addressLine: string;
  email: string;
  phone: string;
  paymentDetails: string;
  bankChargesNote: string;
  defaultNote: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  terms: string;
  currency: string;
  client: ClientInfo;
  items: InvoiceItem[];
  taxRate: number;      // e.g. 0.0 or 16.0
  discount: number;     // fixed discount amount or deduction
  notes: string;
  firm: FirmInfo;
}

export interface CalculatedTotals {
  subtotal: number;
  discount: number;
  taxableAmount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}
