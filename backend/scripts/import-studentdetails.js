const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const prisma = new PrismaClient();

const csvPath =
  process.argv[2] ||
  'C:\\Users\\Rajesh\\OneDrive\\Desktop\\studentdetails1.csv';

const DEFAULT_DEPARTMENT = process.env.IMPORT_DEFAULT_DEPARTMENT || 'CSE';
const DEFAULT_PROGRAM = process.env.IMPORT_DEFAULT_PROGRAM || 'B.Tech';
const FACULTY_EMAIL_DOMAIN =
  process.env.IMPORT_FACULTY_EMAIL_DOMAIN || 'faculty.vignan.local';
const STUDENT_EMAIL_DOMAIN =
  process.env.IMPORT_STUDENT_EMAIL_DOMAIN || 'student.vignan.local';
const DEFAULT_PASSWORD = process.env.IMPORT_DEFAULT_PASSWORD || 'temp123';

function parseCsv(text) {
  const rows = [];
  let current = '';
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(current.trim());
      current = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(current.trim());
      current = '';
      if (row.some((cell) => cell !== '')) rows.push(row);
      row = [];
      continue;
    }

    current += char;
  }

  if (current || row.length > 0) {
    row.push(current.trim());
    if (row.some((cell) => cell !== '')) rows.push(row);
  }

  return rows;
}

function normalizeHeader(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function normalizeName(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizeFacultyKey(value) {
  return normalizeName(value).toLowerCase();
}

function parseYear(value) {
  const text = String(value || '').trim().toUpperCase();
  if (text === 'I') return 1;
  if (text === 'II') return 2;
  if (text === 'III') return 3;
  if (text === 'IV') return 4;
  const year = Number(text);
  return Number.isFinite(year) && year > 0 ? year : 1;
}

function parseCgpa(value) {
  const cgpa = Number(value);
  return Number.isFinite(cgpa) ? cgpa : null;
}

function graduationYearFromStudentId(studentId) {
  const batch = Number(String(studentId || '').slice(0, 2));
  return Number.isFinite(batch) ? 2000 + batch + 4 : null;
}

function isValidEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.|\.$/g, '');
}

function makeUniqueEmail(preferred, fallbackLocalPart, domain, usedEmails, currentEmail) {
  const normalizedCurrent = String(currentEmail || '').toLowerCase();
  let candidate = isValidEmail(preferred);
  const safeLocal =
    slugify(fallbackLocalPart) || String(Date.now()).toLowerCase();

  if (!candidate) {
    candidate = `${safeLocal}@${domain}`.toLowerCase();
  }

  if (candidate === normalizedCurrent || !usedEmails.has(candidate)) {
    return candidate;
  }

  let suffix = 1;
  do {
    candidate = `${safeLocal}${suffix}@${domain}`.toLowerCase();
    suffix += 1;
  } while (usedEmails.has(candidate) && candidate !== normalizedCurrent);

  return candidate;
}

function mapRows(csvRows) {
  const headerRow = csvRows[0] || [];
  const headers = headerRow.map(normalizeHeader);

  return csvRows.slice(1).map((row, index) => {
    const data = { rowNumber: index + 2 };
    headers.forEach((header, colIndex) => {
      data[header] = row[colIndex] || '';
    });
    return {
      rowNumber: data.rowNumber,
      studentId: String(data.registerno || data.studentid || data.id || '')
        .trim()
        .toUpperCase(),
      fullName: normalizeName(data.name || data.studentname || data.fullname),
      section: String(data.sectioncode || data.section || '').trim() || 'NA',
      email: String(data.email || '').trim(),
      year: parseYear(data.year),
      counsellorName: normalizeName(
        data.counsellorname ||
          data.counselorname ||
          data.facultyname ||
          data.mentorname,
      ),
      cgpa: parseCgpa(data.cgpa),
    };
  });
}

async function loadExistingState() {
  const [users, faculty] = await Promise.all([
    prisma.user.findMany({ select: { email: true } }),
    prisma.faculty.findMany(),
  ]);

  const usedEmails = new Set(users.map((user) => user.email.toLowerCase()));
  const usedEmployeeIds = new Set(faculty.map((item) => item.employeeId));
  const facultyByName = new Map();

  faculty.forEach((item) => {
    facultyByName.set(normalizeFacultyKey(item.fullName), item);
  });

  return { usedEmails, usedEmployeeIds, facultyByName };
}

function nextEmployeeId(usedEmployeeIds) {
  let index = usedEmployeeIds.size + 1;
  let employeeId = '';
  do {
    employeeId = `FAC${String(index).padStart(4, '0')}`;
    index += 1;
  } while (usedEmployeeIds.has(employeeId));
  usedEmployeeIds.add(employeeId);
  return employeeId;
}

async function ensureFaculty(row, state, passwordHash, stats, facultyCredentialRows) {
  if (!row.counsellorName) return null;

  const key = normalizeFacultyKey(row.counsellorName);
  const existing = state.facultyByName.get(key);
  if (existing) return existing;

  const employeeId = nextEmployeeId(state.usedEmployeeIds);
  const email = makeUniqueEmail(
    '',
    slugify(row.counsellorName) || employeeId.toLowerCase(),
    FACULTY_EMAIL_DOMAIN,
    state.usedEmails,
  );
  state.usedEmails.add(email);

  const user = await prisma.user.create({
    data: {
      name: row.counsellorName,
      email,
      password: passwordHash,
      role: 'faculty',
      department: DEFAULT_DEPARTMENT,
    },
  });

  const faculty = await prisma.faculty.create({
    data: {
      userId: user.id,
      employeeId,
      fullName: row.counsellorName,
      email,
      department: DEFAULT_DEPARTMENT,
      section: row.section,
    },
  });

  state.facultyByName.set(key, faculty);
  stats.facultyCreated += 1;
  facultyCredentialRows.push({
    employeeId,
    fullName: row.counsellorName,
    email,
    password: DEFAULT_PASSWORD,
  });

  return faculty;
}

async function importRow(row, state, passwordHash, stats, facultyCredentialRows) {
  if (!row.studentId || !/^\d{3}[A-Z]{2}[A-Z0-9]{5}$/.test(row.studentId)) {
    stats.failed += 1;
    stats.errors.push(`Row ${row.rowNumber}: invalid registration number "${row.studentId}".`);
    return;
  }

  if (!row.fullName) {
    stats.failed += 1;
    stats.errors.push(`Row ${row.rowNumber}: missing student name.`);
    return;
  }

  const faculty = await ensureFaculty(
    row,
    state,
    passwordHash,
    stats,
    facultyCredentialRows,
  );

  const existingStudent = await prisma.student.findUnique({
    where: { studentId: row.studentId },
    include: { user: true },
  });
  const graduationYear = graduationYearFromStudentId(row.studentId);

  const email = makeUniqueEmail(
    row.email,
    row.studentId.toLowerCase(),
    STUDENT_EMAIL_DOMAIN,
    state.usedEmails,
    existingStudent?.user.email,
  );

  if (existingStudent) {
    await prisma.$transaction([
      prisma.student.update({
        where: { id: existingStudent.id },
        data: {
          fullName: row.fullName,
          department: DEFAULT_DEPARTMENT,
          program: DEFAULT_PROGRAM,
          year: row.year,
          semester: 1,
          graduationYear,
          email,
          section: row.section,
          cgpa: row.cgpa,
          counsellorId: faculty?.employeeId || null,
        },
      }),
      prisma.user.update({
        where: { id: existingStudent.userId },
        data: {
          name: row.fullName,
          email,
          department: DEFAULT_DEPARTMENT,
        },
      }),
    ]);
    stats.studentsUpdated += 1;
  } else {
    const user = await prisma.user.create({
      data: {
        name: row.fullName,
        email,
        password: passwordHash,
        role: 'student',
        department: DEFAULT_DEPARTMENT,
      },
    });

    await prisma.student.create({
      data: {
        userId: user.id,
        studentId: row.studentId,
        fullName: row.fullName,
        department: DEFAULT_DEPARTMENT,
        program: DEFAULT_PROGRAM,
        year: row.year,
        semester: 1,
        graduationYear,
        email,
        section: row.section,
        cgpa: row.cgpa,
        counsellorId: faculty?.employeeId || null,
      },
    });
    stats.studentsCreated += 1;
  }

  state.usedEmails.add(email);

  if (faculty) {
    const student = await prisma.student.findUnique({
      where: { studentId: row.studentId },
      select: { id: true },
    });
    if (student) {
      await prisma.assignment.upsert({
        where: { studentId: student.id },
        update: { facultyId: faculty.id },
        create: { studentId: student.id, facultyId: faculty.id },
      });
      stats.assignmentsUpserted += 1;
    }
  }
}

function writeFacultyCredentials(facultyCredentialRows) {
  if (facultyCredentialRows.length === 0) return '';

  const outputDir = path.resolve(__dirname, '..', 'import-results');
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, 'faculty-credentials.csv');
  const csv = [
    'employeeId,fullName,email,password',
    ...facultyCredentialRows.map((row) =>
      [row.employeeId, row.fullName, row.email, row.password]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(','),
    ),
  ].join('\n');

  fs.writeFileSync(outputPath, csv, 'utf8');
  return outputPath;
}

async function main() {
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found: ${csvPath}`);
  }

  const csvText = fs.readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, '');
  const rows = mapRows(parseCsv(csvText));
  const state = await loadExistingState();
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const stats = {
    rowsRead: rows.length,
    studentsCreated: 0,
    studentsUpdated: 0,
    facultyCreated: 0,
    assignmentsUpserted: 0,
    failed: 0,
    errors: [],
  };
  const facultyCredentialRows = [];

  for (const row of rows) {
    await importRow(row, state, passwordHash, stats, facultyCredentialRows);
    const done =
      stats.studentsCreated + stats.studentsUpdated + stats.failed;
    if (done % 500 === 0) {
      console.log(`Imported ${done}/${stats.rowsRead} rows...`);
    }
  }

  const credentialsPath = writeFacultyCredentials(facultyCredentialRows);
  const [studentCount, facultyCount, assignmentCount] = await Promise.all([
    prisma.student.count(),
    prisma.faculty.count(),
    prisma.assignment.count(),
  ]);

  console.log(
    JSON.stringify(
      {
        ...stats,
        errors: stats.errors.slice(0, 20),
        totalStudentsInDb: studentCount,
        totalFacultyInDb: facultyCount,
        totalAssignmentsInDb: assignmentCount,
        facultyCredentialsPath: credentialsPath,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
