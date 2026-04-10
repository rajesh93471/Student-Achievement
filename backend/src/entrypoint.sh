#!/bin/sh

#!/bin/sh
set -e
echo "Running Prisma Migrations..."
npx prisma migrate deploy
echo "Starting Application..."
exec node dist/main.js

