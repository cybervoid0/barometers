#!/usr/bin/env bun

/**
 * Script to clean up old image files after successful deployment
 * This script removes old UUID-based files that are no longer referenced in the database
 */

import { withPrisma } from '@/prisma/prismaClient'
import { minioBucket, minioClient } from '@/services/minio'

class OldImageCleaner {
  private dryRun: boolean

  constructor(dryRun = true) {
    this.dryRun = dryRun
  }

  /**
   * Get all files from MinIO gallery folder
   */
  private async getAllMinioFiles(): Promise<string[]> {
    const files: string[] = []
    const stream = minioClient.listObjects(minioBucket, 'gallery/', true)

    for await (const obj of stream) {
      if (obj.name) {
        files.push(obj.name)
      }
    }

    return files
  }

  /**
   * Get all current image URLs from database
   */
  private getAllCurrentUrls = withPrisma(async prisma => {
    const images = await prisma.image.findMany({
      select: { url: true },
    })
    return images.map(img => img.url)
  })

  /**
   * Check if filename looks like old UUID-based name
   */
  private isOldUuidFile(fileName: string): boolean {
    // Old format: gallery/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.ext
    // New format: gallery/b-a027__12345678.ext
    const uuidPattern = /^gallery\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\./i
    return uuidPattern.test(fileName)
  }

  /**
   * Clean up old UUID-based files that are not in database
   */
  async cleanup(): Promise<void> {
    console.log(`${this.dryRun ? '🧪 DRY RUN: ' : '🗑️  '}Cleaning up old image files...\n`)

    const minioFiles = await this.getAllMinioFiles()
    const currentUrls = new Set(await this.getAllCurrentUrls())

    console.log(`📊 Total files in MinIO: ${minioFiles.length}`)
    console.log(`📊 Current URLs in database: ${currentUrls.size}\n`)

    // Find old UUID files that are not referenced in database
    const oldFilesToDelete = minioFiles.filter(
      file => this.isOldUuidFile(file) && !currentUrls.has(file),
    )

    if (oldFilesToDelete.length === 0) {
      console.log('✅ No old files to clean up!')
      return
    }

    console.log(`🗑️  Found ${oldFilesToDelete.length} old files to delete:\n`)

    let deleted = 0
    let failed = 0

    for (const [index, fileName] of oldFilesToDelete.entries()) {
      console.log(`[${index + 1}/${oldFilesToDelete.length}] ${fileName}`)

      try {
        if (this.dryRun) {
          console.log(`  [DRY RUN] Would delete: ${fileName}`)
        } else {
          await minioClient.removeObject(minioBucket, fileName)
          console.log(`  ✅ Deleted`)
          deleted++
        }
      } catch (error) {
        console.log(`  ❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        failed++
      }
    }

    console.log(`\n📊 SUMMARY`)
    if (this.dryRun) {
      console.log(`🧪 Would delete: ${oldFilesToDelete.length} files`)
    } else {
      console.log(`✅ Successfully deleted: ${deleted}`)
      console.log(`❌ Failed: ${failed}`)
    }

    if (this.dryRun) {
      console.log('\nUse --execute flag to perform actual cleanup')
    }
  }

  /**
   * Show disk space that would be freed
   */
  async analyzeSpace(): Promise<void> {
    console.log('📊 Analyzing disk space usage...\n')

    const minioFiles = await this.getAllMinioFiles()
    const currentUrls = new Set(await this.getAllCurrentUrls())

    const oldFiles = minioFiles.filter(file => this.isOldUuidFile(file) && !currentUrls.has(file))

    console.log(`📁 Total files in MinIO: ${minioFiles.length}`)
    console.log(`📁 Old UUID files to clean: ${oldFiles.length}`)
    console.log(`📁 Files that will remain: ${minioFiles.length - oldFiles.length}`)

    if (oldFiles.length > 0) {
      console.log(`\n💾 Estimated space savings: ~${oldFiles.length} files`)
      console.log('   (Actual size calculation requires individual file stat calls)')
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  const command = args[0] || 'analyze'
  const dryRun = !args.includes('--execute')

  const cleaner = new OldImageCleaner(dryRun)

  try {
    switch (command) {
      case 'analyze':
        await cleaner.analyzeSpace()
        break

      case 'cleanup':
        if (dryRun) {
          console.log('🧪 DRY RUN MODE - No files will be deleted')
          console.log('Use --execute flag to perform actual cleanup\n')
        }
        await cleaner.cleanup()
        break

      default:
        console.log('Usage:')
        console.log('  bun run scripts/cleanup-old-images.ts analyze')
        console.log('  bun run scripts/cleanup-old-images.ts cleanup [--execute]')
        console.log('')
        console.log('Commands:')
        console.log('  analyze  - Analyze old files without making changes')
        console.log('  cleanup  - Clean up old UUID-based files (dry-run by default)')
        console.log('')
        console.log('Options:')
        console.log('  --execute - Actually delete files (default is dry-run)')
        process.exit(1)
    }
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

if (import.meta.main) {
  main()
}
