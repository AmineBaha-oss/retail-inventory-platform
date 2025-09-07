#!/bin/bash
set -e

# Load test data into retail_inventory DB after Spring Boot startup
PGUSER=retail_user
PGDATABASE=retail_inventory
PGHOST=postgres
PGPASSWORD=retail_password
export PGUSER PGDATABASE PGHOST PGPASSWORD

echo "[load-test-data.sh] Waiting for Spring Boot to start..."
sleep 10

echo "[load-test-data.sh] Loading test data..."
psql -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -f /docker-entrypoint-initdb.d/10-enhanced-test-data.sql

echo "[load-test-data.sh] Test data load complete."
