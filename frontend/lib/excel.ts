"use client";

const normalizeKey = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "");

export type ParsedRow = Record<string, string | number | null>;

export async function readExcelFile(file: File): Promise<ParsedRow[]> {
  const XLSX = await import("xlsx");
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, string | number | null>>(worksheet, {
    defval: null,
  });

  return rows.map((row) => {
    const normalized: ParsedRow = {};
    Object.keys(row).forEach((key) => {
      normalized[normalizeKey(key)] = row[key];
    });
    return normalized;
  });
}

export async function downloadExcelFile({
  rows,
  fileName,
  sheetName = "Sheet1",
  hyperlinkColumns = [],
}: {
  rows: Record<string, string | number | null | undefined>[];
  fileName: string;
  sheetName?: string;
  hyperlinkColumns?: string[];
}) {
  const XLSX = await import("xlsx");
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];

  hyperlinkColumns.forEach((columnName) => {
    const columnIndex = headers.indexOf(columnName);
    if (columnIndex === -1) {
      return;
    }

    rows.forEach((row, rowIndex) => {
      const value = row[columnName];
      if (!value || typeof value !== "string") {
        return;
      }

      const cellAddress = XLSX.utils.encode_cell({ c: columnIndex, r: rowIndex + 1 });
      const cell = worksheet[cellAddress];
      if (!cell) {
        return;
      }

      cell.l = { Target: value, Tooltip: value };
      cell.s = {
        font: { color: { rgb: "2563EB" }, underline: true },
      };
    });
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, fileName);
}
