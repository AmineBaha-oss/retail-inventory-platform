#!/bin/bash

# Database backup script for TimescaleDB
# This script creates daily backups of the retail inventory database

set -e

# Configuration
DB_HOST="${DB_HOST:-postgres}"
DB_NAME="${DB_NAME:-retail_inventory}"
DB_USER="${DB_USERNAME:-retail_user}"
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/retail_inventory_backup_${DATE}.sql"
RETENTION_DAYS=30

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "Starting database backup at $(date)"

# Create the backup
pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" \
    --verbose \
    --no-password \
    --format=custom \
    --compress=9 \
    --file="${BACKUP_FILE}.dump"

# Also create a plain SQL backup for easier restoration
pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" \
    --verbose \
    --no-password \
    --format=plain \
    --file="$BACKUP_FILE"

# Compress the SQL backup
gzip "$BACKUP_FILE"

echo "Backup completed: ${BACKUP_FILE}.gz"

# Clean up old backups (keep only last 30 days)
find "$BACKUP_DIR" -name "retail_inventory_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "retail_inventory_backup_*.dump" -type f -mtime +$RETENTION_DAYS -delete

echo "Old backups cleaned up (retention: $RETENTION_DAYS days)"

# List current backups
echo "Current backups:"
ls -la "$BACKUP_DIR"/retail_inventory_backup_*

echo "Backup process completed at $(date)"
