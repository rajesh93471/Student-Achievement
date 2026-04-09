const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.student.count();
  const students = await prisma.student.findMany({
    select: { studentId: true, fullName: true, email: true },
    take: 10
  });
  console.log('Total Students:', count);
  console.log('Sample:', JSON.stringify(students, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
