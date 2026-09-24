import * as XLSX from "xlsx";

// Column headers accepted in the uploaded sheet (mirrors exportToExcel's
// output so a previously-exported file re-imports cleanly), mapped to the
// Product payload field they fill.
const COLUMN_MAP = {
  "Product Name": "name",
  SKU: "sku",
  EAN: "ean",
  Quantity: "quantity",
  "Minimum Stock": "minimumStock",
  Brand: "category",
};

const REQUIRED_HEADERS = ["Product Name", "SKU", "EAN", "Brand", "Quantity", "Minimum Stock"];

const readFileAsArrayBuffer = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });

/**
 * Parses an uploaded .xlsx/.xls/.csv file into product rows.
 * Throws an Error with a user-facing message if required columns are missing
 * or the sheet has no data rows.
 */
export const parseProductsExcel = async (file) => {
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
