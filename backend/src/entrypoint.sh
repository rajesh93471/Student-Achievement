#!/bin/sh

# Exit on error
set -e

echo "Running Prisma Migrations..."
# npx prisma migrate deploy applies any pending migrations to the production DB
npx prisma migrate deploy

# Optionally: npx prisma db seed (uncomment if you want to seed on every start/deploy)
# echo "Running Database Seed..."
# npm run seed

echo "Starting Application..."
exec node dist/main.js
