# MinIO Setup Guide

## Overview

This project uses MinIO for object storage. We have separate buckets for different environments to avoid mixing production and development data.

## Architecture

- **Production**: Remote MinIO server (configured via environment variables)
- **Development**: Local MinIO in Docker (localhost:9000)
- **Backup**: Automatic sync from production to local storage

## Quick Start

### 1. Start Local MinIO

```bash
bun run minio:dev
```

This uses `docker-compose.dev.yml` to ensure it only runs in development.

This starts MinIO on:
- **API**: http://localhost:9000
- **Console**: http://localhost:9001

Default credentials:
- Username: `minioadmin`
- Password: `minioadmin`

### 2. Create Buckets

Open MinIO Console at http://localhost:9001 and create:
- `barometers-dev` - for local development
- `barometers-prod` - for production mirror (optional)

Or use MinIO Client (mc):
```bash
mc alias set local http://localhost:9000 minioadmin minioadmin
mc mb local/barometers-dev
```

### 3. Configure Environment

Create `.env.local` for development:

```bash
# Local MinIO Configuration
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
NEXT_PUBLIC_MINIO_URL=http://localhost:9000
NEXT_PUBLIC_MINIO_BUCKET=barometers-dev

# Other variables...
```

Create `.env.production` for production:

```bash
# Production MinIO Configuration
MINIO_ENDPOINT=your-production-endpoint.com
MINIO_ACCESS_KEY=your-production-access-key
MINIO_SECRET_KEY=your-production-secret-key
NEXT_PUBLIC_MINIO_URL=https://your-production-endpoint.com
NEXT_PUBLIC_MINIO_BUCKET=barometers-prod
```

## Backup Commands

### Backup to Local MinIO

Syncs production bucket to local Docker MinIO:

```bash
bun run minio:backup:local
```

### Backup to Filesystem

Downloads all files to `./minio-backups` directory:

```bash
bun run minio:backup:filesystem
```

Custom path:

```bash
bun scripts/minio-backup.ts --filesystem --path /custom/backup/path
```

### Full Backup

Syncs to both local MinIO and filesystem:

```bash
bun run minio:backup:all
```

## Daily Workflow

1. **Start development**:
   ```bash
   bun run minio:dev
   bun run dev
   ```

2. **Work with local files** - all uploads go to `barometers-dev` bucket

3. **Need production data?** Run backup:
   ```bash
   bun run minio:backup:local
   ```

4. **Stop MinIO** when done:
   ```bash
   bun run minio:stop
   ```

## Backup Strategy

Recommended backup schedule:

1. **Daily**: Filesystem backup (can be automated via cron)
   ```bash
   0 2 * * * cd /path/to/project && bun run minio:backup:filesystem
   ```

2. **Weekly**: Full backup to both local MinIO and filesystem
   ```bash
   bun run minio:backup:all
   ```

3. **Before deployment**: Always backup before major changes

## Troubleshooting

### Cannot connect to local MinIO

Check if Docker container is running:
```bash
docker ps | grep barometers-minio
```

Restart if needed:
```bash
bun run minio:stop
bun run minio:dev
```

### Port conflicts

If ports 9000 or 9001 are taken, modify `docker-compose.dev.yml`:

### Backup fails

1. Check `.env.production` has correct credentials
2. Verify network connectivity to production MinIO
3. Check production bucket name is correct

### Port conflicts

If ports 9000 or 9001 are taken, modify `docker-compose.dev.yml`:

```yaml
ports:
  - '9002:9000'  # Change host port
  - '9003:9001'  # Change host port
```

## Security Notes

- ⚠️ Never commit `.env.local` or `.env.production`
- 🔒 Use strong passwords for production MinIO
- 📦 Keep backup files secure and encrypted
- 🚫 Don't expose local MinIO ports publicly

## Data Isolation

Current setup ensures:
- Development data → `barometers-dev` bucket (local)
- Production data → `barometers` bucket (remote)
- No cross-contamination between environments
- Safe testing without affecting production

## Additional Resources

- [MinIO Documentation](https://min.io/docs/minio/linux/index.html)
- [MinIO Client (mc)](https://min.io/docs/minio/linux/reference/minio-mc.html)
- [Docker Compose](https://docs.docker.com/compose/)
