# Student Achievement and Profile Management System

A full-stack university portal for managing student profiles, achievements, documents, and notifications.

## Stack

- Frontend: Next.js 15 (Static Export via Nginx), React 19, TypeScript, Tailwind CSS
- Backend: NestJS 11, Prisma, JWT authentication
- Database: MySQL
- Storage: Local File Storage (Local `uploads/` folder) 

## Features

- **Route Prefix**: All system components are served under the `/achieve` path.
- **Roles**: 
  - **Student**: Manage profile, view academic status, upload achievements.
  - **Faculty**: View student achievements in their department.
  - **Admin**: Full system control.

## Running with Docker (Recommended)

The system is fully containerized and easy to run using Docker Compose.

### Prerequisites

- Docker and Docker Compose installed.
- A `.env` file in the root directory (copy from `.env.example`).

### Start the system

1.  **Prepare environment**:
    ```bash
    cp .env.example .env
    ```
    (Edit `.env` as needed)

2.  **Launch the stack**:
    ```bash
    docker-compose up --build
    ```

The system will be available at:
- **Frontend**: [http://localhost:3000/achieve](http://localhost:3000/achieve)
- **Backend API**: [http://localhost:5001/achieve](http://localhost:5001/achieve)

## Manual Development

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Useful scripts

- **Build Docker images**: `docker-compose build`
- **Stop system**: `docker-compose down`
- **View logs**: `docker-compose logs -f`

## Documentation

- API reference: [`docs/API.md`](./docs/API.md)
- Database schema: [`docs/DATABASE_SCHEMA.md`](./docs/DATABASE_SCHEMA.md)
- Deployment guide: [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md)
