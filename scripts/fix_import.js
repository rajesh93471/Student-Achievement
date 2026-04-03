const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', 'backend', 'src', 'modules', 'admin', 'admin.service.ts');
let content = fs.readFileSync(filePath, 'utf8');
const target = 'import { generateExcelReport, generatePdfReport, generateStudentAchievementsPdf } from "./report.service";';
const replacement = 'import { generateExcelReport, generatePdfReport, generateStudentAchievementsPdf, generateAchievementsZip } from "./report.service";';

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(filePath, content);
  console.log('Fixed import successfully.');
} else {
  console.log('Target import not found.');
}
