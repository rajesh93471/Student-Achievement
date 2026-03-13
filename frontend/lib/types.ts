export type Role = "student" | "admin" | "faculty" | "parent";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
  studentId?: string;
  linkedStudentId?: string;
}

export interface StudentProfile {
  _id: string;
  studentId: string;
  fullName: string;
  department: string;
  program: string;
  admissionCategory?: string;
  year: number;
  semester: number;
  email: string;
  phone?: string;
  address?: string;
  profilePhotoUrl?: string;
  cgpa?: number;
  subjectsCompleted: string[];
  backlogs: number;
  achievementsCount: number;
  documentsCount: number;
}

export interface Achievement {
  _id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  academicYear?: string;
  semester?: number;
  activityType?: string;
  status: "pending" | "approved" | "rejected";
  feedback?: string;
  certificateUrl?: string;
  recommendedForAward?: boolean;
}

export interface DocumentItem {
  _id: string;
  title: string;
  type: string;
  fileUrl: string;
  mimeType?: string;
  size: number;
  createdAt?: string;
}
