import * as XLSX from "xlsx";
import { buildColumnMap } from "./excelHeaderMap";

// Recognized header spellings per Product field, normalized (lowercase, no
// punctuation, single spaces - see normalizeHeader). Covers both our own
// export format ("Product Name", "SKU", "Minimum Stock", ...) and the kind
// of supplier/distributor sheet that ships with headers like "Item Code*",
// "Item Description*", "Brand*", "EAN CODE" instead.
const FIELD_ALIASES = {
  sku: ["item code", "sku", "sku code", "itemcode"],
  name: ["item description", "product name", "description", "name", "item name"],
  category: ["brand"],
  ean: ["ean code", "ean", "barcode", "ean13"],
  packSize: ["pack size", "packsize", "pack"],
  mrp: ["mrp", "m r p"],
  quantity: ["quantity", "qty", "opening stock"],
  minimumStock: ["minimum stock", "min stock", "reorder level"],
  expiryDate: ["expiry date", "expiry", "exp date"],
};

// Only these block a row/sheet from importing - see productController.js's
// importProducts for why the rest (quantity, pack size, MRP, expiry date)
// are treated as optional: most supplier catalogs simply don't carry them.
const REQUIRED_FIELDS = ["sku", "name", "category", "ean"];

const EMPTY_ROW = {
  name: "",
  sku: "",
  ean: "",
  category: "",
  quantity: "",
  minimumStock: "",
  packSize: "",
  mrp: "",
  expiryDate: "",
};

const readFileAsArrayBuffer = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });

/**
 * Parses an uploaded .xlsx/.xls/.csv file into product rows. Reads every
 * sheet in the workbook (a supplier file is often split one-sheet-per-brand)
 * and, for each, matches its own headers against FIELD_ALIASES independently
 * - so sheets with slightly different column sets/order still work.
 * Throws an Error with a user-facing message only if no sheet has enough
 * columns to identify a product, or the file has no data rows at all.
 */
export const parseProductsExcel = async (file) => {
  const buffer = await readFileAsArrayBuffer(file);
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });

  const rows = [];
  const skippedSheets = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    if (rawRows.length === 0) continue;

    const columnMap = buildColumnMap(Object.keys(rawRows[0]), FIELD_ALIASES);
    const missing = REQUIRED_FIELDS.filter((f) => !columnMap[f]);
    if (missing.length > 0) {
      skippedSheets.push(`"${sheetName}" (missing ${missing.join(", ")})`);
      continue;
    }

    for (const raw of rawRows) {
      const row = { ...EMPTY_ROW };
      for (const [field, header] of Object.entries(columnMap)) {
        row[field] = raw[header] ?? "";
      }
      // Skip fully-blank trailing rows some sheets have after the last item.
      if (!String(row.sku).trim() && !String(row.name).trim() && !String(row.ean).trim()) {
        continue;
      }
      rows.push(row);
    }
  }

  if (rows.length === 0) {
    if (skippedSheets.length > 0) {
      throw new Error(
        `Couldn't find SKU/Name/Brand/EAN columns in: ${skippedSheets.join("; ")}`,
      );
    }
    throw new Error("The uploaded file has no data rows");
  }

  return rows;
};
