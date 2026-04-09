
const testHeaders = [
  'Reg Number',
  'Student ID',
  'Full Name',
  'Name',
  'Email',
  'Branch',
  'Department',
  'Stream',
  'Course',
  'Program',
  'Year',
  'Graduation Year',
  'Sem',
  'Semester',
  'Phone',
  'Mobile',
  'Contact',
  'Password'
];

function mapHeaders(headerList) {
  const headers = {};
  headerList.forEach((val, index) => {
    const colNumber = index + 1;
    val = String(val || '').trim().toLowerCase();
    
    if (val.includes('studentid') || val.includes('reg') || val.includes('registration') || val === 'id') {
      headers[colNumber] = 'studentId';
    } else if (val.includes('name') || val.includes('full')) {
      headers[colNumber] = 'fullName';
    } else if (val.includes('email') || val.includes('mail')) {
      headers[colNumber] = 'email';
    } else if (val.includes('dept') || val.includes('branch') || val.includes('stream')) {
      headers[colNumber] = 'department';
    } else if (val.includes('prog') || val.includes('course')) {
      headers[colNumber] = 'program';
    } else if (val.includes('grad')) {
      headers[colNumber] = 'graduationYear';
    } else if (val.includes('year')) {
      headers[colNumber] = 'year';
    } else if (val.includes('sem')) {
      headers[colNumber] = 'semester';
    } else if (val.includes('cgpa') || val.includes('gpa')) {
      headers[colNumber] = 'cgpa';
    } else if (val.includes('phone') || val.includes('mobile') || val.includes('contact')) {
      headers[colNumber] = 'phone';
    } else if (val.includes('pass')) {
      headers[colNumber] = 'password';
    }
  });
  return headers;
}

const results = mapHeaders(testHeaders);
console.log('Identified Mappings:');
Object.entries(results).forEach(([col, field]) => {
  console.log(`${testHeaders[col-1].padEnd(20)} -> ${field}`);
});

// Verify critical ones
const mappedFields = Object.values(results);
const critical = ['studentId', 'fullName', 'email', 'department', 'program'];
const missing = critical.filter(f => !mappedFields.includes(f));

if (missing.length === 0) {
  console.log('\nSUCCESS: All critical fields mapped correctly!');
} else {
  console.log('\nFAILURE: Missing fields:', missing.join(', '));
}
