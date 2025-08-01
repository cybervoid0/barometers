#!/bin/bash

# Simple script to import data from remote database to local PostgreSQL

set -e

echo "🗄️  Importing data from remote database..."

# Source environment variables
source .env.local

LOCAL_DB="barometers_local"

DUMP_FILE="temp_dump_$(date +%Y%m%d_%H%M%S).sql"

echo "🔌 Killing existing SSH tunnels..."
pkill -f "ssh.*$REMOTE_DB_IP:5432" || true
sleep 2

echo "📡 Opening SSH tunnel on port 5433..."
ssh -fN -L 5433:$REMOTE_DB_IP:5432 $REMOTE_USER@$REMOTE_HOST

# Wait for tunnel
sleep 3

echo "💾 Creating database dump..."
echo "Connecting to remote database: $REMOTE_DB_NAME as user: $REMOTE_DB_USER"

# Set password
export PGPASSWORD="$REMOTE_DB_PASSWORD"

# Create FULL dump from remote database through tunnel
/opt/homebrew/opt/postgresql@17/bin/pg_dump -h localhost -p 5433 -U "$REMOTE_DB_USER" "$REMOTE_DB_NAME" --clean --no-owner --no-privileges > "$DUMP_FILE"

echo "🧹 Closing SSH tunnel..."
pkill -f "ssh.*$REMOTE_DB_IP:5432" || true

echo "🔄 Restoring to local database..."
export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"

# Import full dump (this will recreate everything)
psql -d "$LOCAL_DB" < "$DUMP_FILE"

echo "🗑️  Cleaning up..."
rm "$DUMP_FILE"

echo "✅ Data import complete!"
echo "🚀 You can now run: npm run dev"
