// Shared header-matching helpers for the Excel importers (products + stock
// transactions), so both recognize the same variety of column spellings -
// our own export format ("Product Name", "SKU", ...) as well as a typical
// supplier/distributor sheet ("Item Code*", "Item Description*", "EAN CODE").

// "Item Code*" -> "item code", "Brand*_1" (SheetJS's auto-suffix for a
// duplicate header) -> "brand", "M R P*" -> "m r p".
export const normalizeHeader = (header) =>
  String(header)
    .replace(/_\d+$/, "")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

// Maps each header present in a sheet to the field it fills, picking the
// first matching header (in sheet column order) per field so a
// duplicate/renamed column never overwrites an earlier match.
export const buildColumnMap = (headers, fieldAliases) => {
  const normalized = headers.map((h) => ({ raw: h, norm: normalizeHeader(h) }));
  const map = {};
  for (const [field, aliases] of Object.entries(fieldAliases)) {
    const match = normalized.find((h) => aliases.includes(h.norm));
    if (match) map[field] = match.raw;
  }
  return map;
};
