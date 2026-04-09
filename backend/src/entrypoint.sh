#!/bin/sh

# Exit on error
set -e

echo "Waiting for database to be ready..."
# Simple loop to wait for MySQL port 3306 on host 'db'
# Using nc (netcat) which is available in alpine
RETRIES=60
while ! nc -z db 3306; do
  echo "Database not ready, waiting... ($RETRIES retries left)"
  sleep 2
  RETRIES=$((RETRIES - 1))
  if [ $RETRIES -le 0 ]; then
    echo "Database connection timed out!"
    exit 1
  fi
done

echo "Running Prisma Migrations..."
# npx prisma migrate deploy applies any pending migrations to the production DB
npx prisma migrate deploy

echo "Starting Application..."
exec node dist/main.js
