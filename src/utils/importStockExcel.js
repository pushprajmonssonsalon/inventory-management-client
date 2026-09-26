import * as XLSX from "xlsx";

// Column headers accepted in the uploaded sheet, mapped to the stock-import
// payload field they fill. Mirrors the product export/import sheet (Product
// Name, SKU, EAN, Brand, Pack Size, MRP, Expiry Date) so the same file can be
// reused - just add Type (+ Reference/Note) columns to turn a product list
// into a stock-transaction sheet. Only SKU/EAN (to find the product), Type
// and Quantity actually drive anything server-side; the rest travel along
// for the user's own reference and are never written back to the product.
const COLUMN_MAP = {
  "Product Name": "name",
  SKU: "sku",
  EAN: "ean",
  Brand: "category",
  "Pack Size": "packSize",
  MRP: "mrp",
  "Expiry Date": "expiryDate",
  Type: "type",
  Quantity: "quantity",
  Reference: "referenceId",
  Note: "note",
};

const REQUIRED_HEADERS = ["Type", "Quantity"];

export const STOCK_TRANSACTION_TYPES = [
  "Stock In",
  "Stock Out",
  "Customer Return",
  "Supplier Return",
  "Damaged Return",
];

const readFileAsArrayBuffer = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });

/**
 * Parses an uploaded .xlsx/.xls/.csv file into stock-transaction rows.
 * Throws an Error with a user-facing message if required columns are missing
 * or the sheet has no data rows.
 */
export const parseStockTransactionsExcel = async (file) => {
  const buffer = await readFileAsArrayBuffer(file);
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  if (rawRows.length === 0) {
    throw new Error("The uploaded file has no data rows");
  }

  const headers = Object.keys(rawRows[0]);
  const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
  if (missing.length > 0) {
    throw new Error(`Missing required column(s): ${missing.join(", ")}`);
  }

  const rows = rawRows.map((raw) => {
    const row = {};
    for (const [header, field] of Object.entries(COLUMN_MAP)) {
      row[field] = raw[header] ?? "";
    }
    return row;
  });

  return rows;
};
