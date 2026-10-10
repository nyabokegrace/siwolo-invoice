import { FirmInfo, InvoiceData } from "./types";

export const DEFAULT_FIRM_INFO: FirmInfo = {
  name: "Siwolo P.O. Law Advocates",
  addressLine: "Mbandu Complex, Langata Road",
  email: "info@siwoloadvocates.com",
  phone: "(254) 792300520",
  paymentDetails: "PAYMENT DETAILS: Paybill 625625 : Account Number: 7719608429: Bank - National Bank of Kenya",
  bankChargesNote: "NOTE: ALL BANK CHARGES ON YOUR ACCOUNT",
  defaultNote: "Thank you for your business!",
};

export const REFERENCE_SAMPLE_INVOICE: InvoiceData = {
  invoiceNumber: "1",
  invoiceDate: "2026-09-24",
  dueDate: "2026-09-24",
  terms: "Due upon receipt",
  currency: "KES",
  client: {
    name: "The Chemelil Sugar Educational Trustees",
    addressLine1: "Chemelil",
    addressLine2: "Muhoroni",
    postalCode: "117 - 40107",
    phone: "25421759867",
    email: "",
    customerId: "P052535598Z",
  },
  items: [
    {
      id: "item-1",
      description: "File Opening",
      quantity: 1,
      unitPrice: 10000,
    },
    {
      id: "item-2",
      description: "For Drawing Petition",
      quantity: 1,
      unitPrice: 50000,
    },
    {
      id: "item-3",
      description: "For Drawing Application",
      quantity: 1,
      unitPrice: 30000,
    },
    {
      id: "item-4",
      description: "For Drawing Supplementary Affidavit",
      quantity: 1,
      unitPrice: 30000,
    },
    {
      id: "item-5",
      description: "For Printing and Service Upon AG",
      quantity: 1,
      unitPrice: 4000,
    },
    {
      id: "item-6",
      description: "25th June Court Attendance",
      quantity: 1,
      unitPrice: 5000,
    },
    {
      id: "item-7",
      description: "16th July Court Attendance",
      quantity: 1,
      unitPrice: 5000,
    },
  ],
  taxRate: 0.0,
  discount: 0,
  notes: "Thank you for your business!",
  firm: DEFAULT_FIRM_INFO,
};

export const INITIAL_EMPTY_INVOICE: InvoiceData = {
  invoiceNumber: "INV-0001",
  invoiceDate: "2026-10-09",
  dueDate: "2026-10-09",
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
  items: [
    {
      id: "item-init-1",
      description: "Legal Consultation & Advisory Services",
      quantity: 1,
      unitPrice: 15000,
    },
  ],
  taxRate: 0.0,
  discount: 0,
  notes: "Thank you for your business!",
  firm: DEFAULT_FIRM_INFO,
};

export const COMMON_LEGAL_SERVICES = [
  "File Opening",
  "For Drawing Petition",
  "For Drawing Application",
  "For Drawing Supplementary Affidavit",
  "For Printing and Service Upon AG",
  "Court Attendance",
  "Legal Consultation & Advisory",
  "Preparation of Legal Opinion",
  "Drafting Commercial Agreement",
  "Conveyancing & Property Transfer",
  "Company Incorporation & Registration",
  "Due Diligence & Search Services",
];

export const CURRENCY_OPTIONS = [
  { code: "KES", label: "KES - Kenyan Shilling", symbol: "KES" },
  { code: "USD", label: "USD - US Dollar", symbol: "$" },
  { code: "EUR", label: "EUR - Euro", symbol: "€" },
  { code: "GBP", label: "GBP - British Pound", symbol: "£" },
  { code: "UGX", label: "UGX - Ugandan Shilling", symbol: "UGX" },
  { code: "TZS", label: "TZS - Tanzanian Shilling", symbol: "TZS" },
];

export const PAYMENT_TERMS_OPTIONS = [
  "Due upon receipt",
  "Immediate Payment",
  "Net 7 Days",
  "Net 14 Days",
  "Net 30 Days",
  "50% Deposit, Balance upon Completion",
];
