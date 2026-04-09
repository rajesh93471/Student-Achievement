import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import sampleStudents from './sampleStudents.json';
import * as bcrypt from 'bcryptjs';

dotenv.config();

const prisma = new PrismaClient();

const seed = async () => {
  await prisma.notification.deleteMany();
  await prisma.document.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.student.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();

  await prisma.department.createMany({
    data: [
      { name: 'Computer Science', code: 'CSE', hodName: 'Dr. Kavita Rao' },
      { name: 'Electronics', code: 'ECE', hodName: 'Dr. Arun Bhat' },
      { name: 'Management', code: 'MBA', hodName: 'Dr. Neha Kapoor' },
    ],
  });

  const admin = await prisma.user.create({
    data: {
      name: 'Vijay',
      email: 'vijay@gmail.com',
      password: await bcrypt.hash('vijay@123', 10),
      role: 'admin',
      department: 'Administration',
    },
  });


  for (const item of sampleStudents as any[]) {
    const user = await prisma.user.create({
      data: {
        name: item.name,
        email: item.email,
        password: await bcrypt.hash('Student@123', 10),
        role: 'student',
        department: item.department,
      },
    });

    const student = await prisma.student.create({
      data: {
        userId: user.id,
        studentId: item.studentId,
        fullName: item.name,
        department: item.department,
        program: item.program,
        year: item.year,
        semester: item.semester,
        email: item.email,
        phone: item.phone,
        cgpa: item.cgpa,
        backlogs: item.backlogs,
        subjectsCompleted: item.subjectsCompleted,
        achievementsCount: item.achievements.length,
      },
    });

    if (Array.isArray(item.achievements) && item.achievements.length) {
      await prisma.achievement.createMany({
        data: item.achievements.map((achievement: any) => ({
          studentId: student.id,
          ...achievement,
          date: achievement?.date ? new Date(achievement.date) : new Date(),
        })),
      });
    }
  }

  console.log('Seed completed', {
    admin: admin.email,
    studentPassword: 'Student@123',
  });
};

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
