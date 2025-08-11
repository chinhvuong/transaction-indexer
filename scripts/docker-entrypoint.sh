#!/bin/sh

# Exit on any error
set -e

echo "🚀 Starting NestJS Backend Boilerplate..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until node -e "
const { Client } = require('pg');
const client = new Client({
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'tx-crawler'
});

client.connect()
  .then(() => {
    console.log('Database is ready!');
    client.end();
    process.exit(0);
  })
  .catch((err) => {
    console.log('Database not ready yet, retrying...');
    client.end();
    process.exit(1);
  });
" 2>/dev/null; do
  echo "Database not ready yet, retrying in 5 seconds..."
  sleep 5
done

echo "✅ Database is ready!"

# Run database migrations
echo "🔄 Running database migrations..."
npm run db:run

echo "✅ Migrations completed!"

# Start the application
echo "🚀 Starting application..."
exec npm run start:prod 