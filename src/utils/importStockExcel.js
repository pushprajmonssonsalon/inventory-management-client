import * as XLSX from "xlsx";
import { buildColumnMap } from "./excelHeaderMap";

// Same field set as the product importer (see importFromExcel.js) plus the
// stock-movement-specific columns. Lets a user hand us either our own export
// format or a raw supplier sheet ("Item Code*", "Item Description*", "EAN
// CODE") and just add Type/Quantity/Reference/Note - or leave those blank
// and fill them in on the review screen in StockImportPage instead.
const FIELD_ALIASES = {
  sku: ["item code", "sku", "sku code", "itemcode"],
  name: ["item description", "product name", "description", "name", "item name"],
  category: ["brand"],
  ean: ["ean code", "ean", "barcode", "ean13"],
  packSize: ["pack size", "packsize", "pack"],
  mrp: ["mrp", "m r p"],
  expiryDate: ["expiry date", "expiry", "exp date"],
  type: ["type", "transaction type", "action"],
  quantity: ["quantity", "qty"],
  referenceId: ["reference", "reference id", "reference number", "ref", "ref no"],
  note: ["note", "notes", "remarks"],
};

// A row/sheet only needs to be identifiable by SKU or EAN - name/brand/etc.
// are just for the user's own reference (see StockImportPage's review table).
const IDENTIFYING_FIELDS = ["sku", "ean"];

const EMPTY_ROW = {
  name: "",
  sku: "",
  ean: "",
  category: "",
  packSize: "",
  mrp: "",
  expiryDate: "",
  type: "",
  quantity: "",
  referenceId: "",
  note: "",
};

const readFileAsArrayBuffer = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });

/**
 * Parses an uploaded .xlsx/.xls/.csv file into stock-transaction rows. Reads
 * every sheet (a supplier file is often split one-sheet-per-brand) and
 * matches each sheet's own headers independently, so sheets with slightly
 * different column sets/order still work. Type and Quantity are never
 * required here - a plain product list imports fine, and the review step in
 * StockImportPage lets the user fill both in by hand per row before anything
 * is sent to the server.
 * Throws an Error with a user-facing message only if no sheet has a SKU or
 * EAN column to identify products by, or the file has no data rows at all.
 */
export const parseStockTransactionsExcel = async (file) => {
  const buffer = await readFileAsArrayBuffer(file);
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });

  const rows = [];
  const skippedSheets = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    if (rawRows.length === 0) continue;

    const columnMap = buildColumnMap(Object.keys(rawRows[0]), FIELD_ALIASES);
    if (!IDENTIFYING_FIELDS.some((f) => columnMap[f])) {
      skippedSheets.push(`"${sheetName}" (no SKU or EAN column)`);
      continue;
    }

    for (const raw of rawRows) {
      const row = { ...EMPTY_ROW };
      for (const [field, header] of Object.entries(columnMap)) {
        row[field] = raw[header] ?? "";
      }
      // Skip fully-blank trailing rows some sheets have after the last item.
      if (!String(row.sku).trim() && !String(row.ean).trim() && !String(row.name).trim()) {
        continue;
      }
      rows.push(row);
    }
  }

  if (rows.length === 0) {
    if (skippedSheets.length > 0) {
      throw new Error(`Couldn't find a SKU/EAN column in: ${skippedSheets.join("; ")}`);
    }
    throw new Error("The uploaded file has no data rows");
  }

  return rows;
};

export const STOCK_TRANSACTION_TYPES = [
  "Stock In",
  "Stock Out",
  "Customer Return",
  "Supplier Return",
  "Damaged Return",
];
