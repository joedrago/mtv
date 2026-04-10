#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$SCRIPT_DIR/.."
DB="$ROOT/data/mtv.sqlite"
BACKUP_DIR="$ROOT/backups"

mkdir -p "$BACKUP_DIR"

TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
DEST="$BACKUP_DIR/mtv-$TIMESTAMP.sqlite"

# Use sqlite3's .backup command for a safe online backup (handles WAL mode)
sqlite3 "$DB" ".backup '$DEST'"

echo "Backed up to $DEST"

# Keep only the 30 most recent backups
ls -1t "$BACKUP_DIR"/mtv-*.sqlite | tail -n +31 | xargs -r rm --
