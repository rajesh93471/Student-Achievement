#!/bin/sh

# Exit on error
set -e

echo "Running Prisma Migrations..."
# npx prisma migrate deploy applies any pending migrations to the production DB
npx prisma migrate deploy

if [ "$SEED_DATABASE" = "true" ]; then
  echo "Seeding Database..."
  npm run seed
fi

echo "Starting Application..."
exec node dist/main.js
