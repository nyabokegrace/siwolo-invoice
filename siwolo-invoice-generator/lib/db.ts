import { Pool } from "pg";
import { PGlite } from "@electric-sql/pglite";
import path from "path";
import fs from "fs";
import { ClientInfo, FirmInfo, InvoiceData, InvoiceItem } from "./types";
import { DEFAULT_FIRM_INFO } from "./defaults";

let pool: Pool | null = null;
let pgliteInstance: PGlite | null = null;
let isInitialized = false;

// Determine and initialize the active PostgreSQL engine
async function getDbClient(): Promise<{
  query: (sql: string, params?: unknown[]) => Promise<{ rows: any[] }>;
  engine: "remote_postgresql" | "embedded_postgresql";
}> {
  const connectionString = process.env.DATABASE_URL;

  // Mode 1: Remote/Docker PostgreSQL instance
  if (connectionString) {
    if (!pool) {
      pool = new Pool({
        connectionString,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });
    }
    return {
      query: (sql: string, params?: unknown[]) => pool!.query(sql, params as any[]),
      engine: "remote_postgresql",
    };
  }

  // Mode 2: Persistent embedded PostgreSQL 17 engine
  if (!pgliteInstance) {
    const dataDir = path.join(process.cwd(), "data", "siwolo_pg");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    pgliteInstance = new PGlite(dataDir);
  }

  return {
    query: async (sql: string, params?: unknown[]) => {
      const res = await pgliteInstance!.query(sql, params as any[]);
      return { rows: res.rows };
    },
    engine: "embedded_postgresql",
  };
}

export async function initDb(): Promise<boolean> {
  if (isInitialized) return true;

  try {
    const db = await getDbClient();
    await db.query(`
      CREATE TABLE IF NOT EXISTS firm_profile (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address_line VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(100) NOT NULL,
        payment_details TEXT NOT NULL,
        bank_charges_note TEXT NOT NULL,
        default_note TEXT NOT NULL,
        logo_url TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        address_line1 VARCHAR(255) DEFAULT '',
        address_line2 VARCHAR(255) DEFAULT '',
        postal_code VARCHAR(100) DEFAULT '',
        phone VARCHAR(100) DEFAULT '',
        email VARCHAR(255) DEFAULT '',
        customer_id VARCHAR(100) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id VARCHAR(100) PRIMARY KEY,
        invoice_number VARCHAR(100) UNIQUE NOT NULL,
        invoice_date VARCHAR(50) NOT NULL,
        due_date VARCHAR(50) NOT NULL,
        terms VARCHAR(100) DEFAULT 'Due upon receipt',
        currency VARCHAR(20) DEFAULT 'KES',
        status VARCHAR(50) DEFAULT 'draft',
        tax_rate NUMERIC(10, 3) DEFAULT 0.0,
        discount NUMERIC(12, 2) DEFAULT 0.0,
        notes TEXT DEFAULT 'Thank you for your business!',
        client_name VARCHAR(255) NOT NULL,
        client_address1 VARCHAR(255) DEFAULT '',
        client_address2 VARCHAR(255) DEFAULT '',
        client_postal VARCHAR(100) DEFAULT '',
        client_phone VARCHAR(100) DEFAULT '',
        client_email VARCHAR(255) DEFAULT '',
        client_customer_id VARCHAR(100) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id VARCHAR(100) PRIMARY KEY,
        invoice_id VARCHAR(100) REFERENCES invoices(id) ON DELETE CASCADE,
        description TEXT NOT NULL,
        quantity NUMERIC(10, 2) DEFAULT 1.0,
        unit_price NUMERIC(12, 2) DEFAULT 0.0,
        sort_order INT DEFAULT 0
      );
    `);
    isInitialized = true;
    return true;
  } catch (err) {
    console.error("Database connection initialization error:", err);
    return false;
  }
}

export async function getDbHealth(): Promise<{
  connected: boolean;
  engine: string;
  version?: string;
}> {
  try {
    const db = await getDbClient();
    await initDb();
    const res = await db.query("SELECT version();");
    return {
      connected: true,
      engine: db.engine,
      version: res.rows[0]?.version,
    };
  } catch (err) {
    return {
      connected: false,
      engine: "disconnected",
    };
  }
}

// -------------------------------------------------------------
// FIRM PROFILE DATABASE OPERATIONS
// -------------------------------------------------------------

export async function getFirmProfileDb(): Promise<FirmInfo | null> {
  try {
    const db = await getDbClient();
    await initDb();
    const res = await db.query(
      `SELECT name, address_line as "addressLine", email, phone, 
              payment_details as "paymentDetails", bank_charges_note as "bankChargesNote", 
              default_note as "defaultNote", logo_url as "logoUrl"
       FROM firm_profile WHERE id = 'default' LIMIT 1;`
    );
    if (res.rows.length > 0) {
      return res.rows[0] as FirmInfo;
    }
  } catch (err) {
    console.error("Failed to fetch firm profile from database:", err);
  }
  return null;
}

export async function saveFirmProfileDb(firm: FirmInfo): Promise<boolean> {
  try {
    const db = await getDbClient();
    await initDb();
    await db.query(
      `INSERT INTO firm_profile (id, name, address_line, email, phone, payment_details, bank_charges_note, default_note, logo_url, updated_at)
       VALUES ('default', $1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         address_line = EXCLUDED.address_line,
         email = EXCLUDED.email,
         phone = EXCLUDED.phone,
         payment_details = EXCLUDED.payment_details,
         bank_charges_note = EXCLUDED.bank_charges_note,
         default_note = EXCLUDED.default_note,
         logo_url = EXCLUDED.logo_url,
         updated_at = CURRENT_TIMESTAMP;`,
      [
        firm.name,
        firm.addressLine,
        firm.email,
        firm.phone,
        firm.paymentDetails,
        firm.bankChargesNote,
        firm.defaultNote,
        firm.logoUrl || null,
      ]
    );
    return true;
  } catch (err) {
    console.error("Failed to save firm profile to database:", err);
    return false;
  }
}

// -------------------------------------------------------------
// CLIENTS DATABASE OPERATIONS
// -------------------------------------------------------------

export async function getClientsDb(): Promise<ClientInfo[]> {
  try {
    const db = await getDbClient();
    await initDb();
    const res = await db.query(
      `SELECT id, name, address_line1 as "addressLine1", address_line2 as "addressLine2",
              postal_code as "postalCode", phone, email, customer_id as "customerId"
       FROM clients ORDER BY updated_at DESC;`
    );
    return res.rows as ClientInfo[];
  } catch (err) {
    console.error("Failed to fetch clients from database:", err);
    return [];
  }
}

export async function saveClientDb(client: ClientInfo): Promise<boolean> {
  if (!client.name?.trim()) return false;
  try {
    const db = await getDbClient();
    await initDb();
    const id = client.id || `client-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    await db.query(
      `INSERT INTO clients (id, name, address_line1, address_line2, postal_code, phone, email, customer_id, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
       ON CONFLICT (name) DO UPDATE SET
         address_line1 = EXCLUDED.address_line1,
         address_line2 = EXCLUDED.address_line2,
         postal_code = EXCLUDED.postal_code,
         phone = EXCLUDED.phone,
         email = EXCLUDED.email,
         customer_id = EXCLUDED.customer_id,
         updated_at = CURRENT_TIMESTAMP;`,
      [
        id,
        client.name.trim(),
        client.addressLine1 || "",
        client.addressLine2 || "",
        client.postalCode || "",
        client.phone || "",
        client.email || "",
        client.customerId || "",
      ]
    );
    return true;
  } catch (err) {
    console.error("Failed to save client to database:", err);
    return false;
  }
}

// -------------------------------------------------------------
// INVOICES DATABASE OPERATIONS
// -------------------------------------------------------------

export async function getInvoicesDb(): Promise<InvoiceData[]> {
  try {
    const db = await getDbClient();
    await initDb();

    const invRes = await db.query(
      `SELECT id, invoice_number as "invoiceNumber", invoice_date as "invoiceDate",
              due_date as "dueDate", terms, currency, status,
              tax_rate as "taxRate", discount, notes,
              client_name as "clientName", client_address1 as "clientAddress1",
              client_address2 as "clientAddress2", client_postal as "clientPostal",
              client_phone as "clientPhone", client_email as "clientEmail",
              client_customer_id as "clientCustomerId",
              created_at as "createdAt", updated_at as "updatedAt"
       FROM invoices ORDER BY updated_at DESC;`
    );

    if (invRes.rows.length === 0) return [];

    const firm = (await getFirmProfileDb()) || { ...DEFAULT_FIRM_INFO };

    const itemsRes = await db.query(
      `SELECT id, invoice_id as "invoiceId", description, quantity, unit_price as "unitPrice", sort_order as "sortOrder"
       FROM invoice_items ORDER BY sort_order ASC;`
    );

    const itemsByInvoice = new Map<string, InvoiceItem[]>();
    for (const row of itemsRes.rows) {
      const list = itemsByInvoice.get(row.invoiceId) || [];
      list.push({
        id: row.id,
        description: row.description,
        quantity: parseFloat(row.quantity),
        unitPrice: parseFloat(row.unitPrice),
      });
      itemsByInvoice.set(row.invoiceId, list);
    }

    return invRes.rows.map((row) => ({
      id: row.id,
      invoiceNumber: row.invoiceNumber,
      invoiceDate: row.invoiceDate,
      dueDate: row.dueDate,
      terms: row.terms,
      currency: row.currency,
      status: row.status,
      taxRate: parseFloat(row.taxRate),
      discount: parseFloat(row.discount),
      notes: row.notes,
      client: {
        name: row.clientName,
        addressLine1: row.clientAddress1,
        addressLine2: row.clientAddress2,
        postalCode: row.clientPostal,
        phone: row.clientPhone,
        email: row.clientEmail,
        customerId: row.clientCustomerId,
      },
      items: itemsByInvoice.get(row.id) || [],
      firm,
      createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : undefined,
      updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : undefined,
    }));
  } catch (err) {
    console.error("Failed to fetch invoices from database:", err);
    return [];
  }
}

export async function saveInvoiceDb(invoice: InvoiceData): Promise<boolean> {
  try {
    const db = await getDbClient();
    await initDb();
    const id = invoice.id || `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    await db.query("BEGIN");

    await db.query(
      `INSERT INTO invoices (
        id, invoice_number, invoice_date, due_date, terms, currency, status,
        tax_rate, discount, notes,
        client_name, client_address1, client_address2, client_postal,
        client_phone, client_email, client_customer_id,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, CURRENT_TIMESTAMP)
      ON CONFLICT (invoice_number) DO UPDATE SET
        invoice_date = EXCLUDED.invoice_date,
        due_date = EXCLUDED.due_date,
        terms = EXCLUDED.terms,
        currency = EXCLUDED.currency,
        status = EXCLUDED.status,
        tax_rate = EXCLUDED.tax_rate,
        discount = EXCLUDED.discount,
        notes = EXCLUDED.notes,
        client_name = EXCLUDED.client_name,
        client_address1 = EXCLUDED.client_address1,
        client_address2 = EXCLUDED.client_address2,
        client_postal = EXCLUDED.client_postal,
        client_phone = EXCLUDED.client_phone,
        client_email = EXCLUDED.client_email,
        client_customer_id = EXCLUDED.client_customer_id,
        updated_at = CURRENT_TIMESTAMP;`,
      [
        id,
        invoice.invoiceNumber,
        invoice.invoiceDate,
        invoice.dueDate,
        invoice.terms || "Due upon receipt",
        invoice.currency || "KES",
        invoice.status || "draft",
        invoice.taxRate || 0,
        invoice.discount || 0,
        invoice.notes || "Thank you for your business!",
        invoice.client?.name || "",
        invoice.client?.addressLine1 || "",
        invoice.client?.addressLine2 || "",
        invoice.client?.postalCode || "",
        invoice.client?.phone || "",
        invoice.client?.email || "",
        invoice.client?.customerId || "",
      ]
    );

    await db.query("DELETE FROM invoice_items WHERE invoice_id = $1;", [id]);

    for (let i = 0; i < invoice.items.length; i++) {
      const item = invoice.items[i];
      const itemId = item.id || `item-${id}-${i + 1}`;
      await db.query(
        `INSERT INTO invoice_items (id, invoice_id, description, quantity, unit_price, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6);`,
        [
          itemId,
          id,
          item.description || "",
          item.quantity || 1,
          item.unitPrice || 0,
          i,
        ]
      );
    }

    await db.query("COMMIT");

    if (invoice.client?.name?.trim()) {
      await saveClientDb(invoice.client);
    }

    return true;
  } catch (err) {
    try {
      const db = await getDbClient();
      await db.query("ROLLBACK");
    } catch {
      // ignore
    }
    console.error("Failed to save invoice to database:", err);
    return false;
  }
}

export async function deleteInvoiceDb(idOrNumber: string): Promise<boolean> {
  try {
    const db = await getDbClient();
    await initDb();
    await db.query(
      "DELETE FROM invoices WHERE id = $1 OR invoice_number = $1",
      [idOrNumber]
    );
    return true;
  } catch (err) {
    console.error("Failed to delete invoice from database:", err);
    return false;
  }
}
