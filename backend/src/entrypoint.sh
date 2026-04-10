#!/bin/sh

# Exit on error
set -e

echo "Forcing Database Schema Sync..."
# npx prisma db push forces the DB to match the schema.prisma
npx prisma db push --accept-data-loss

if [ "$SEED_DATABASE" = "true" ]; then
  echo "Seeding Database..."
  npm run seed
fi

echo "Starting Application..."
exec node dist/main.js
