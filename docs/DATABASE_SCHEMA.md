# Database Schema

## Collections

### `users`

- `name: string`
- `email: string` unique
- `password: string` hashed
- `role: "student" | "admin" | "faculty"`
- `department?: string`
- `isActive: boolean`

### `students`

- `user: ObjectId<User>` unique
- `studentId: string` unique
- `fullName: string`
- `department: string`
- `program: string`
- `year: number`
- `semester: number`
- `email: string`
- `phone?: string`
- `address?: string`
- `profilePhotoUrl?: string`
- `semesterGpa?: number`
- `cgpa?: number`
- `subjectsCompleted: string[]`
- `backlogs: number`
- `achievementsCount: number`
- `documentsCount: number`

### `achievements`

- `student: ObjectId<Student>`
- `title: string`
- `description: string`
- `date: Date`
- `category: string`
- `certificateUrl?: string`
- `certificateKey?: string`
- `status: "pending" | "approved" | "rejected"`
- `feedback?: string`
- `recommendedForAward: boolean`
- `verifiedBy?: ObjectId<User>`

### `documents`

- `student: ObjectId<Student>`
- `title: string`
- `type: "marksheet" | "certificate" | "internship-letter" | "publication" | "award" | "other"`
- `fileUrl: string`
- `fileKey: string`
- `mimeType?: string`
- `size: number` max `5MB`

### `departments`

- `name: string`
- `code: string`
- `hodName?: string`

### `facultyprofiles`

- `user: ObjectId<User>` unique
- `department: string`
- `designation?: string`

## Data relationships

- One `user` to one `student` or one `facultyprofile`
- One `student` to many `achievements`
- One `student` to many `documents`
- One `department` to many students and faculty members
