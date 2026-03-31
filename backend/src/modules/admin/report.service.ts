import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { createDownloadUrl } from "../../utils/s3";

export const generateExcelReport = async ({
  sheetName,
  columns,
  rows,
}: {
  sheetName: string;
  columns: any[];
  rows: any[];
}) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);
  sheet.columns = columns;
  sheet.addRows(rows);
  return workbook.xlsx.writeBuffer();
};

export const generatePdfReport = ({ title, lines }: { title: string; lines: string[] }) =>
  new Promise<Buffer>((resolve) => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    doc.fontSize(18).text(title);
    doc.moveDown();
    lines.forEach((line) => doc.fontSize(11).text(line));
    doc.end();
  });

const fetchImageBufferFromUrl = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) return null;

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.startsWith("image/")) return null;

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

const getImageBuffer = async (url?: string | null, key?: string | null) => {
  if (url) {
    try {
      const directBuffer = await fetchImageBufferFromUrl(url);
      if (directBuffer) return directBuffer;
    } catch {
      // Fall through to signed URL lookup.
    }
  }

  if (key) {
    try {
      const payload = await createDownloadUrl({ key });
      if (payload?.downloadUrl) {
        const signedBuffer = await fetchImageBufferFromUrl(payload.downloadUrl);
        if (signedBuffer) return signedBuffer;
      }
    } catch {
      return null;
    }
  }

  return null;
};

const TECHNICAL_CATEGORIES = new Set([
  "hackathon",
  "competition",
  "olympiad",
  "certification",
  "internship",
  "project",
  "research",
  "academic",
]);

const getAchievementGroup = (category?: string | null) =>
  TECHNICAL_CATEGORIES.has(String(category || "").toLowerCase()) ? "Technical achievements" : "Non-technical achievements";

export const generateStudentAchievementsPdf = async ({
  title,
  achievements,
}: {
  title: string;
  achievements: Array<{
    title: string;
    description?: string | null;
    category?: string | null;
    academicYear?: string | null;
    semester?: number | null;
    activityType?: string | null;
    status?: string | null;
    date?: Date | string | null;
    certificateUrl?: string | null;
    certificateKey?: string | null;
    student?: {
      fullName?: string | null;
      studentId?: string | null;
      department?: string | null;
    } | null;
  }>;
}) =>
  new Promise<Buffer>(async (resolve) => {
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const chunks: Buffer[] = [];
    const pageBottom = 770;

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    const ensureSpace = (neededHeight: number) => {
      if (doc.y + neededHeight > pageBottom) {
        doc.addPage();
      }
    };

    const drawSectionLabel = (label: string) => {
      doc.font("Helvetica-Bold").fontSize(11).fillColor("#0d1117").text(label);
      doc.moveDown(0.25);
    };

    const drawMutedText = (text: string) => {
      doc.font("Helvetica").fontSize(10.5).fillColor("#4b5563").text(text, {
        width: 515,
      });
    };

    const drawSubheading = (label: string) => {
      ensureSpace(24);
      doc.font("Helvetica-Bold").fontSize(12).fillColor("#1a56db").text(label);
      doc.moveDown(0.15);
      const lineY = doc.y;
      doc.strokeColor("#dbeafe").lineWidth(1).moveTo(40, lineY).lineTo(555, lineY).stroke();
      doc.moveDown(0.5);
    };

    const studentsMap = achievements.reduce(
      (acc, item) => {
        const key = item.student?.studentId || item.student?.fullName || `student-${acc.size + 1}`;
        const current = acc.get(key) || {
          student: item.student || {},
          technical: [] as typeof achievements,
          nonTechnical: [] as typeof achievements,
        };

        if (getAchievementGroup(item.category) === "Technical achievements") {
          current.technical.push(item);
        } else {
          current.nonTechnical.push(item);
        }

        acc.set(key, current);
        return acc;
      },
      new Map<
        string,
        {
          student: {
            fullName?: string | null;
            studentId?: string | null;
            department?: string | null;
          };
          technical: typeof achievements;
          nonTechnical: typeof achievements;
        }
      >()
    );

    doc.font("Helvetica-Bold").fontSize(20).fillColor("#0d1117").text(title);
    doc.moveDown(0.6);
    doc.font("Helvetica").fontSize(10).fillColor("#57606a").text(`Generated on ${new Date().toLocaleString()}`);
    doc.moveDown(1);

    const drawAchievementItem = async (item: (typeof achievements)[number]) => {
      ensureSpace(220);
      const achievementYear = item.date ? new Date(item.date).getFullYear() : "";

      doc.font("Helvetica-Bold").fontSize(12).fillColor("#0d1117").text(item.title || "Untitled achievement");
      doc.moveDown(0.2);
      drawMutedText(
        [
          item.category ? `Category: ${item.category}` : "",
          achievementYear ? `Year: ${achievementYear}` : "",
          item.activityType ? `Activity type: ${item.activityType}` : "",
          item.status ? `Status: ${item.status}` : "",
        ]
          .filter(Boolean)
          .join(" | ")
      );

      if (item.description) {
        doc.moveDown(0.35);
        drawSectionLabel("Achievement details");
        doc.font("Helvetica").fontSize(10.5).fillColor("#374151").text(item.description, {
          width: 515,
        });
      }

      if (item.certificateUrl || item.certificateKey) {
        const imageBuffer = await getImageBuffer(item.certificateUrl, item.certificateKey);
        doc.moveDown(0.5);
        if (imageBuffer) {
          drawSectionLabel("Achievement image");
          const imageTop = doc.y;
          try {
            doc.image(imageBuffer, 40, imageTop, {
              fit: [360, 220],
              align: "left",
              valign: "top",
            });
            doc.y = imageTop + 228;
          } catch {
            doc.font("Helvetica").fontSize(10).fillColor("#b91c1c").text("Unable to embed achievement image.");
            doc.moveDown(0.5);
          }
        } else {
          drawSectionLabel("Certificate file");
          drawMutedText(item.certificateUrl || item.certificateKey || "File unavailable");
        }
      }
    };

    const studentEntries = Array.from(studentsMap.values());

    for (let studentIndex = 0; studentIndex < studentEntries.length; studentIndex += 1) {
      const entry = studentEntries[studentIndex];

      ensureSpace(130);
      const cardTop = doc.y;
      doc
        .roundedRect(40, cardTop, 515, 80, 12)
        .fillAndStroke("#ffffff", "#dbe3f0");

      doc.y = cardTop + 16;
      doc.font("Helvetica-Bold").fontSize(16).fillColor("#0d1117").text(entry.student.fullName || "Student", 56, doc.y, {
        width: 490,
      });
      doc.moveDown(0.15);
      doc.font("Helvetica-Bold").fontSize(12.5).fillColor("#1d4ed8").text(entry.student.studentId || "Reg ID", 56, doc.y, {
        width: 490,
      });
      doc.moveDown(0.25);
      drawMutedText(`Department: ${entry.student.department || "-"}`);
      doc.y = Math.max(doc.y, cardTop + 96);

      doc.moveDown(0.45);
      doc.font("Helvetica-Bold").fontSize(13).fillColor("#0d1117").text("Achievements");
      doc.moveDown(0.5);

      const sections = [
        { heading: "Technical achievements", items: entry.technical },
        { heading: "Non-technical achievements", items: entry.nonTechnical },
      ];

      for (const section of sections) {
        drawSubheading(section.heading);

        if (section.items.length === 0) {
          doc.font("Helvetica").fontSize(10.5).fillColor("#6b7280").text("None");
          doc.moveDown(0.8);
          continue;
        }

        for (let itemIndex = 0; itemIndex < section.items.length; itemIndex += 1) {
          await drawAchievementItem(section.items[itemIndex]);
          doc.moveDown(0.8);
          if (itemIndex < section.items.length - 1) {
            doc.strokeColor("#e5e7eb").lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
            doc.moveDown(0.8);
          }
        }
      }

      if (studentIndex < studentEntries.length - 1) {
        ensureSpace(26);
        doc.strokeColor("#cbd5e1").lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
        doc.moveDown(1.2);
      }
    }

    doc.end();
  });
