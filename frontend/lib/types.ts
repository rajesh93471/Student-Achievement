export type Role = "student" | "admin" | "faculty";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
  studentId?: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  studentId: string;
  fullName: string;
  department: string;
  program: string;
  admissionCategory?: string;
  year: number;
  semester: number;
  graduationYear?: number;
  email: string;
  phone?: string;
  address?: string;
  profilePhotoUrl?: string;
  cgpa?: number;
  subjectsCompleted?: any;
  backlogs: number;
  achievementsCount: number;
  documentsCount: number;
}

export interface Achievement {
  id: string;
  studentId: string;
  title: string;
  description: string;
  date: string;
  academicYear?: string;
  semester?: number;
  category: string;
  activityType?: string;
  organizedBy?: string;
  position?: string;
  certificateUrl?: string;
  status: "pending" | "approved" | "rejected";
  verifiedById?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentItem {
  id: string;
  studentId: string;
  title: string;
  type: string;
  fileUrl: string;
  mimeType?: string;
  size?: number;
  createdAt?: string;
  updatedAt?: string;
}
