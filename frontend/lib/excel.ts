"use client";

import * as XLSX from "xlsx";

const normalizeKey = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "");

export type ParsedRow = Record<string, string | number | null>;

export async function readExcelFile(file: File): Promise<ParsedRow[]> {
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

export function downloadExcelFile({
  rows,
  fileName,
  sheetName = "Sheet1",
}: {
  rows: Record<string, string | number | null | undefined>[];
  fileName: string;
  sheetName?: string;
}) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, fileName);
}
