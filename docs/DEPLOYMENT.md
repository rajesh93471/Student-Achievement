# Deployment Guide

## Frontend on Vercel

1. Import the `frontend` directory as a Vercel project.
2. Set environment variable:
   - `NEXT_PUBLIC_API_URL=https://your-backend-domain/api`
3. Build command: `npm run build`
4. Output: default Next.js output

## Backend on Render or Railway

1. Import the `backend` directory as a Node service.
2. Set environment variables from [backend/.env.example](/C:/Users/Rajesh/OneDrive/Desktop/StuAch/backend/.env.example)
3. Start command: `npm start`
4. Build command: `npm install`

## MongoDB Atlas

1. Create a cluster and database user
2. Replace `MONGODB_URI` with the Atlas connection string
3. Restrict network access to deployment providers where possible

## AWS S3

1. Create a bucket for student documents
2. Configure CORS for frontend upload origins
3. Set:
   - `AWS_REGION`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_S3_BUCKET`
4. Apply an IAM policy limited to object upload for the specific bucket

## Production recommendations

- Rotate JWT secret and AWS credentials regularly
- Add refresh-token or cookie-based session hardening for enterprise deployments
- Add background jobs for notifications and portfolio generation
- Add object lifecycle rules and malware scanning for uploaded files
- Place analytics endpoints behind caching if dashboard traffic grows significantly
