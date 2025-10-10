/**
 * MinIO Backup Script
 * Syncs files from production MinIO to local MinIO or filesystem
 */

import path from 'node:path'
import dotenv from 'dotenv'
import { ensureDirSync } from 'fs-extra'
import { Client as Minio } from 'minio'
import pLimit from 'p-limit'

// Load production environment variables (override any existing env vars)
dotenv.config({ path: path.resolve(__dirname, '..', '.env.production'), override: true })

const prodEndpoint: string = process.env.MINIO_ENDPOINT ?? ''
const prodAccessKey: string = process.env.MINIO_ACCESS_KEY ?? ''
const prodSecretKey: string = process.env.MINIO_SECRET_KEY ?? ''
const prodBucket: string = process.env.NEXT_PUBLIC_MINIO_BUCKET ?? ''
const localBucket: string = 'barometers-dev' // Local development bucket

if (!prodEndpoint || !prodAccessKey || !prodSecretKey || !prodBucket) {
  throw new Error('Missing production MinIO configuration in .env.production')
}

// Production MinIO client
const prodClient = new Minio({
  endPoint: prodEndpoint,
  useSSL: true,
  accessKey: prodAccessKey,
  secretKey: prodSecretKey,
})

// Local MinIO client (from docker-compose)
const localClient = new Minio({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'minioadmin',
  secretKey: 'minioadmin',
})

interface BackupOptions {
  toLocal: boolean
  toFilesystem: boolean
  filesystemPath?: string
  limit?: number
  concurrency?: number
  skipExisting?: boolean
}

async function ensureBucketExists(client: Minio, bucketName: string): Promise<void> {
  const exists = await client.bucketExists(bucketName)
  if (!exists) {
    await client.makeBucket(bucketName, 'us-east-1')
    console.log(`✅ Created bucket: ${bucketName}`)
  }
}

async function downloadToFilesystem(objectName: string, localPath: string): Promise<void> {
  const fullPath = path.join(localPath, objectName)
  const dir = path.dirname(fullPath)

  ensureDirSync(dir)

  await prodClient.fGetObject(prodBucket, objectName, fullPath)
}

async function objectExists(
  client: Minio,
  bucketName: string,
  objectName: string,
): Promise<boolean> {
  try {
    await client.statObject(bucketName, objectName)
    return true
  } catch {
    return false
  }
}

async function copyToLocalMinio(objectName: string, skipExisting = false): Promise<void> {
  if (skipExisting && (await objectExists(localClient, localBucket, objectName))) {
    return // Skip if already exists
  }

  const stream = await prodClient.getObject(prodBucket, objectName)
  const chunks: Buffer[] = []

  for await (const chunk of stream) {
    chunks.push(chunk)
  }

  const buffer = Buffer.concat(chunks)
  await localClient.putObject(localBucket, objectName, buffer)
}

async function syncMinioBackup(options: BackupOptions): Promise<void> {
  console.log('🚀 Starting MinIO backup...')
  console.log(`📦 Source: ${prodEndpoint}/${prodBucket}`)

  if (options.toLocal) {
    await ensureBucketExists(localClient, localBucket)
    console.log(`📦 Destination: Local MinIO (localhost:9000/${localBucket})`)
  }

  if (options.toFilesystem && options.filesystemPath) {
    ensureDirSync(options.filesystemPath)
    console.log(`📦 Destination: Filesystem (${options.filesystemPath})`)
  }

  const objects: string[] = []
  const stream = prodClient.listObjects(prodBucket, '', true)

  for await (const obj of stream) {
    if (obj.name) {
      objects.push(obj.name)
    }
  }

  // Apply limit if specified
  const objectsToSync = options.limit ? objects.slice(0, options.limit) : objects
  console.log(`📊 Found ${objects.length} objects, syncing ${objectsToSync.length}`)

  let successCount = 0
  let errorCount = 0
  let skippedCount = 0

  const concurrency = options.concurrency || 5
  const limit = pLimit(concurrency)

  console.log(`🔄 Processing with concurrency limit of ${concurrency}...`)

  const promises = objectsToSync.map(objectName =>
    limit(async () => {
      try {
        let wasSkipped = false

        if (options.toLocal) {
          if (options.skipExisting && (await objectExists(localClient, localBucket, objectName))) {
            skippedCount++
            wasSkipped = true
          } else {
            await copyToLocalMinio(objectName, options.skipExisting)
          }
        }

        if (options.toFilesystem && options.filesystemPath) {
          await downloadToFilesystem(objectName, options.filesystemPath)
        }

        if (!wasSkipped) {
          successCount++
        }

        process.stdout.write(
          `\r✅ Synced ${successCount}/${objectsToSync.length} objects (${skippedCount} skipped, ${errorCount} errors)`,
        )
        return { success: true, skipped: wasSkipped }
      } catch (error) {
        errorCount++
        console.error(`\n❌ Error syncing ${objectName}:`, error)
        process.stdout.write(
          `\r✅ Synced ${successCount}/${objectsToSync.length} objects (${skippedCount} skipped, ${errorCount} errors)`,
        )
        return { success: false, skipped: false, error }
      }
    }),
  )

  await Promise.all(promises)

  console.log(`\n\n✨ Backup completed!`)
  console.log(`   Success: ${successCount}`)
  if (errorCount > 0) {
    console.log(`   Errors: ${errorCount}`)
  }
}

// CLI interface
const args = process.argv.slice(2)
const toLocal = args.includes('--local')
const toFilesystem = args.includes('--filesystem')
const skipExisting = args.includes('--skip-existing')

const filesystemPath = args.includes('--path')
  ? args[args.indexOf('--path') + 1]
  : path.join(__dirname, '..', 'minio-backups')

const limit = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1], 10) : undefined

const concurrency = args.includes('--concurrency')
  ? parseInt(args[args.indexOf('--concurrency') + 1], 10)
  : 5

if (!toLocal && !toFilesystem) {
  console.log(`
Usage: bun scripts/minio-backup.ts [options]

Options:
  --local                    Sync to local MinIO (docker-compose)
  --filesystem               Sync to filesystem
  --path <path>              Custom filesystem path (default: ./minio-backups)
  --limit <number>           Limit number of objects to sync (for testing)
  --concurrency <number>     Number of parallel downloads (default: 5)
  --skip-existing            Skip objects that already exist in destination

Examples:
  bun scripts/minio-backup.ts --local
  bun scripts/minio-backup.ts --local --limit 10
  bun scripts/minio-backup.ts --local --skip-existing
  bun scripts/minio-backup.ts --local --concurrency 10
  bun scripts/minio-backup.ts --filesystem --path /backup/minio
  `)
  process.exit(1)
}

syncMinioBackup({
  toLocal,
  toFilesystem,
  filesystemPath,
  limit,
  concurrency,
  skipExisting,
}).catch(error => {
  console.error('❌ Backup failed:', error)
  process.exit(1)
})
