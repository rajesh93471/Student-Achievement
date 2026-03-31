import { z } from "zod";

const objectIdParam = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});


export const registerStudentSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    studentId: z.string().min(2),
    department: z.string().min(2),
    program: z.string().min(2),
    admissionCategory: z.string().optional(),
    year: z.coerce.number().min(1).max(6),
    semester: z.coerce.number().min(1).max(2),
    phone: z.string().optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const registerParentSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    studentId: z.string().min(2),
    relation: z.string().min(2),
    phone: z.string().optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const profileUpdateSchema = z.object({
  body: z.object({
    fullName: z.string().min(2),
    department: z.string().min(2),
    program: z.string().min(2),
    admissionCategory: z.string().optional(),
    year: z.coerce.number().min(1).max(6),
    semester: z.coerce.number().min(1).max(2),
    email: z.string().email(),
    phone: z.string().optional(),
    address: z.string().optional(),
    cgpa: z.coerce.number().min(0).max(10).optional(),
    backlogs: z.coerce.number().min(0).optional(),
    subjectsCompleted: z.array(z.string()).optional(),
    profilePhotoUrl: z.string().url().optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const achievementSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    description: z.string().min(5),
    date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    category: z.string().min(2),
    academicYear: z.string().optional(),
    semester: z.coerce.number().min(1).max(2).optional(),
    activityType: z.string().optional(),
    certificateUrl: z.string().url().optional(),
    certificateKey: z.string().optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const documentSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    type: z.string().min(2),
    fileUrl: z.string().url(),
    fileKey: z.string().min(2),
    mimeType: z.string().optional(),
    size: z.coerce.number().max(5 * 1024 * 1024),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const notificationSchema = z.object({
  body: z.object({
    message: z.string().min(10),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const userSettingsSchema = z.object({
  body: z.object({
    emailNotifications: z.boolean().optional(),
    smsAlerts: z.boolean().optional(),
    weeklyDigest: z.boolean().optional(),
    profileVisibility: z.boolean().optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6),
    confirmPassword: z.string().min(6),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const idSchema = objectIdParam.extend({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const achievementReviewSchema = z.object({
  body: z.object({
    status: z.enum(["approved", "rejected"]),
    feedback: z.string().optional(),
    recommendedForAward: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
  query: z.object({}).optional(),
});
