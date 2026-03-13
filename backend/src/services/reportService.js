import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

export const generateExcelReport = async ({ sheetName, columns, rows }) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);
  sheet.columns = columns;
  sheet.addRows(rows);
  return workbook.xlsx.writeBuffer();
};

export const generatePdfReport = ({ title, lines }) =>
  new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    doc.fontSize(18).text(title);
    doc.moveDown();
    lines.forEach((line) => doc.fontSize(11).text(line));
    doc.end();
  });
