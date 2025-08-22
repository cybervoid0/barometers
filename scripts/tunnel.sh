#!/bin/bash

# Runs a command with a temporary SSH tunnel to the remote PostgreSQL database

set -e

REMOTE_HOST="${REMOTE_HOST:?REMOTE_HOST not set}"
REMOTE_USER="${REMOTE_USER:-ubuntu}"
REMOTE_DB_IP="${REMOTE_DB_IP:?REMOTE_DB_IP not set}"

if ! pgrep -f "ssh.*$REMOTE_DB_IP:5432" > /dev/null; then
  echo "⏳ Opening SSH tunnel to $REMOTE_HOST..."
  ssh -fN -L 5433:$REMOTE_DB_IP:5432 $REMOTE_USER@$REMOTE_HOST
  export TUNNEL_CREATED_BY_THIS_SCRIPT=1
else
  echo "✅ SSH tunnel already running"
  export TUNNEL_CREATED_BY_THIS_SCRIPT=0
fi

trap 'if [[ $TUNNEL_CREATED_BY_THIS_SCRIPT == 1 ]]; then echo "🧹 Cleaning up SSH tunnel..."; pkill -f "ssh.*$REMOTE_DB_IP:5432"; fi' EXIT

echo "🚀 Executing: $@"
export DATABASE_URL="${REMOTE_DATABASE_URL}"
"$@"
