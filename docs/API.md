# API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

### `POST /auth/login`

Request:

```json
{
  "email": "admin@stuach.edu",
  "password": "Admin@123"
}
```

Response:

```json
{
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "name": "System Admin",
    "email": "admin@stuach.edu",
    "role": "admin"
  }
}
```

### `POST /auth/register/student`

Registers a student account with profile starter fields.

### `GET /auth/me`

Returns the authenticated user context.

## Students

### `GET /students/me`

- Role: `student`
- Returns student profile, achievements, and documents

### `PUT /students/me`

- Role: `student`
- Updates profile information and academic fields

### `GET /students`

- Role: `admin`, `faculty`
- Query params:
  - `search`
  - `department`
  - `semester`
  - `year`
  - `category`

### `GET /students/:id`

- Role: `student`, `admin`, `faculty`
- Student can only access self
- Faculty can only access same department

## Achievements

### `GET /achievements`

- Role: `student`, `admin`, `faculty`
- Query params: `category`, `status`

### `POST /achievements`

- Role: `student`
- Payload:

```json
{
  "title": "Hackathon Winner",
  "description": "Won first place",
  "date": "2025-11-12",
  "category": "hackathon",
  "certificateUrl": "https://bucket.s3.region.amazonaws.com/file.pdf",
  "certificateKey": "students/id/file.pdf"
}
```

### `PUT /achievements/:id`

- Role: `student`
- Resubmission sets status back to `pending`

### `PATCH /achievements/:id/review`

- Role: `admin`, `faculty`
- Payload:

```json
{
  "status": "approved",
  "feedback": "Well documented achievement",
  "recommendedForAward": true
}
```

### `DELETE /achievements/:id`

- Role: `student`, `admin`

## Documents

### `POST /documents/upload-url`

- Role: `student`
- Generates pre-signed upload URL for `PDF`, `JPG`, or `PNG`
- Expected request:

```json
{
  "fileName": "certificate.pdf",
  "contentType": "application/pdf"
}
```

### `GET /documents`

- Role: `student`

### `POST /documents`

- Role: `student`
- Registers uploaded file metadata in MongoDB

### `DELETE /documents/:id`

- Role: `student`, `admin`

## Admin

### `GET /admin/dashboard`

- Role: `admin`
- Returns KPI cards and chart datasets

### `GET /admin/reports`

- Role: `admin`
- Returns:
  - top achievers
  - department achievements
  - student participation
  - certification statistics

### `GET /admin/reports/export?report=top-achievers&format=pdf`

- Role: `admin`
- Supported formats: `pdf`, `excel`

### `POST /admin/students`

- Role: `admin`
- Creates student account and profile

### `DELETE /admin/students/:id`

- Role: `admin`

## Faculty

### `GET /faculty/students`

- Role: `faculty`
- Returns same-department students

### `GET /faculty/queue`

- Role: `faculty`
- Returns pending achievement reviews for the faculty department
