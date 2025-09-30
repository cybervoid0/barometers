#!/usr/bin/env bun

/**
 * Script to rename images in MinIO from UUID-based names to meaningful names
 * based on image name and order fields from the database
 */

import path from 'node:path'
import pLimit from 'p-limit'
import { withPrisma } from '@/prisma/prismaClient'
import { minioBucket, minioClient } from '@/services/minio'

interface ImageRecord {
  id: string
  url: string
  name: string | null
  order: number | null
  blurData: string
  description: string | null
  barometers: Array<{ collectionId: string }>
  manufacturers: Array<{ slug: string | null }>
  categories: Array<{ name: string }>
  documents: Array<{ catalogueNumber: string }>
}

interface ProcessedImage {
  id: string
  oldUrl: string
  newUrl: string
  processed: boolean
  error?: string
}

class ImageRenamer {
  private processedImages: ProcessedImage[] = []
  private dryRun: boolean
  private keepOld: boolean
  private limit: ReturnType<typeof pLimit>

  constructor(dryRun = true, keepOld = false) {
    this.dryRun = dryRun
    this.keepOld = keepOld
    // Limit concurrent MinIO operations to avoid timeouts
    this.limit = pLimit(10)
  }

  /**
   * Generate meaningful filename based on entity type and UUID
   * Format: {type}-{identifier}__{uuid8}.{ext}
   * - Barometer: b-{collectionId}__{uuid8}
   * - Manufacturer: m-{slug}__{uuid8}
   * - Category: c-{name}__{uuid8}
   * - Document: d-{catalogueNumber}__{uuid8}
   */
  private generateNewFileName(
    barometers: Array<{ collectionId: string }>,
    manufacturers: Array<{ slug: string | null }>,
    categories: Array<{ name: string }>,
    documents: Array<{ catalogueNumber: string }>,
    extension: string,
    imageId: string,
  ): string {
    // Use first 8 characters of UUID (without dashes) for uniqueness
    const shortId = imageId.replace(/-/g, '').substring(0, 8)

    // Priority: Barometer > Manufacturer > Category > Document
    if (barometers.length > 0) {
      const collectionId = barometers[0].collectionId.toLowerCase()
      return `gallery/b-${collectionId}__${shortId}${extension}`
    }

    if (manufacturers.length > 0 && manufacturers[0].slug) {
      const slug = manufacturers[0].slug.toLowerCase()
      return `gallery/m-${slug}__${shortId}${extension}`
    }

    if (categories.length > 0) {
      const categoryName = categories[0].name.toLowerCase().replace(/[^a-z0-9]/g, '-')
      return `gallery/c-${categoryName}__${shortId}${extension}`
    }

    if (documents.length > 0) {
      const catalogueNumber = documents[0].catalogueNumber.toLowerCase()
      return `gallery/d-${catalogueNumber}__${shortId}${extension}`
    }

    // Fallback for orphaned images
    return `gallery/orphan__${shortId}${extension}`
  }

  /**
   * Check if file exists in MinIO (with concurrency limit and retry on AccessDenied)
   */
  private async fileExists(fileName: string): Promise<boolean> {
    return this.limit(async () => {
      const maxRetries = 3

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          await minioClient.statObject(minioBucket, fileName)
          return true
        } catch (error: unknown) {
          const errorCode = (error as { code?: string })?.code

          // If AccessDenied, retry (might be temporary MinIO issue)
          if (errorCode === 'AccessDenied' && attempt < maxRetries) {
            console.log(
              `    ⚠️ AccessDenied for ${fileName}, retrying (${attempt}/${maxRetries})...`,
            )
            await new Promise(resolve => setTimeout(resolve, 100 * attempt)) // Exponential backoff
            continue
          }

          // If NotFound or max retries reached, return false
          return false
        }
      }

      return false
    })
  }

  /**
   * Copy file in MinIO from old name to new name (with concurrency limit)
   */
  private async copyFile(oldFileName: string, newFileName: string): Promise<boolean> {
    return this.limit(async () => {
      try {
        if (this.dryRun) {
          console.log(`[DRY RUN] Would copy: ${oldFileName} → ${newFileName}`)
          return true
        }

        await minioClient.copyObject(minioBucket, newFileName, `/${minioBucket}/${oldFileName}`)
        return true
      } catch (error) {
        console.error(`Failed to copy ${oldFileName} to ${newFileName}:`, error)
        return false
      }
    })
  }

  /**
   * Delete old file from MinIO (only if keepOld is false, with concurrency limit)
   */
  private async deleteOldFile(fileName: string): Promise<boolean> {
    return this.limit(async () => {
      try {
        if (this.dryRun) {
          if (this.keepOld) {
            console.log(`[DRY RUN] Would keep old file: ${fileName}`)
          } else {
            console.log(`[DRY RUN] Would delete: ${fileName}`)
          }
          return true
        }

        if (this.keepOld) {
          console.log(`  📁 Keeping old file: ${fileName}`)
          return true
        }

        await minioClient.removeObject(minioBucket, fileName)
        return true
      } catch (error) {
        console.error(`Failed to delete ${fileName}:`, error)
        return false
      }
    })
  }

  /**
   * Update image URL in database
   */
  private updateImageUrl = withPrisma(
    async (prisma, imageId: string, newUrl: string): Promise<boolean> => {
      try {
        if (this.dryRun) {
          console.log(`[DRY RUN] Would update image ${imageId} URL to: ${newUrl}`)
          return true
        }

        await prisma.image.update({
          where: { id: imageId },
          data: { url: newUrl },
        })
        return true
      } catch (error) {
        console.error(`Failed to update image ${imageId} URL:`, error)
        return false
      }
    },
  )

  /**
   * Get all images from database with their relationships
   */
  private getAllImages = withPrisma(async (prisma): Promise<ImageRecord[]> => {
    return await prisma.image.findMany({
      select: {
        id: true,
        url: true,
        name: true,
        order: true,
        blurData: true,
        description: true,
        barometers: { select: { collectionId: true } },
        manufacturers: { select: { slug: true } },
        categories: { select: { name: true } },
        documents: { select: { catalogueNumber: true } },
      },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
    })
  })

  /**
   * Get all files in MinIO gallery folder
   */
  private async getAllMinioFiles(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const files: string[] = []
      const stream = minioClient.listObjects(minioBucket, 'gallery/', true)

      stream.on('data', obj => {
        if (obj.name) {
          files.push(obj.name)
        }
      })

      stream.on('end', () => resolve(files))
      stream.on('error', reject)
    })
  }

  /**
   * Analyze current state without making changes
   */
  async analyze(): Promise<void> {
    console.log('🔍 Analyzing current image state...\n')

    const images = await this.getAllImages()
    const minioFiles = await this.getAllMinioFiles()

    console.log(`📊 Database images: ${images.length}`)
    console.log(`📊 MinIO files: ${minioFiles.length}\n`)

    // Analyze orphaned images (without relationships)
    const orphanedImages = images.filter(
      img =>
        img.barometers.length === 0 &&
        img.manufacturers.length === 0 &&
        img.categories.length === 0 &&
        img.documents.length === 0,
    )
    if (orphanedImages.length > 0) {
      console.log(`⚠️  Orphaned images (no relationships): ${orphanedImages.length}`)
      for (const img of orphanedImages.slice(0, 5)) {
        console.log(`   - ${img.id}: ${img.url} (name: ${img.name || 'none'})`)
      }
      if (orphanedImages.length > 5) {
        console.log(`   ... and ${orphanedImages.length - 5} more`)
      }
      console.log()
    }

    // Test new naming strategy for conflicts
    const newNames = new Set<string>()
    const newNameConflicts: string[] = []

    for (const img of images) {
      const extension = path.extname(img.url)
      const newFileName = this.generateNewFileName(
        img.barometers,
        img.manufacturers,
        img.categories,
        img.documents,
        extension,
        img.id,
      )

      if (newNames.has(newFileName)) {
        newNameConflicts.push(newFileName)
      } else {
        newNames.add(newFileName)
      }
    }

    if (newNameConflicts.length > 0) {
      console.log(`⚠️  New naming conflicts: ${newNameConflicts.length}`)
      for (const name of newNameConflicts.slice(0, 5)) {
        console.log(`   - ${name}`)
      }
    } else {
      console.log(`✅ New naming strategy: NO CONFLICTS!`)
    }
    console.log()

    // Check for orphaned files in MinIO
    const dbUrls = new Set(images.map(img => img.url))
    const orphanedFiles = minioFiles.filter(file => !dbUrls.has(file))

    if (orphanedFiles.length > 0) {
      console.log(`🗑️  Orphaned files in MinIO: ${orphanedFiles.length}`)
      for (const file of orphanedFiles.slice(0, 10)) {
        console.log(`   - ${file}`)
      }
      if (orphanedFiles.length > 10) {
        console.log(`   ... and ${orphanedFiles.length - 10} more`)
      }
      console.log()
    }

    // Show sample of what would be renamed
    const renameable = images.filter(
      img =>
        img.url.startsWith('gallery/') &&
        (img.barometers.length > 0 ||
          img.manufacturers.length > 0 ||
          img.categories.length > 0 ||
          img.documents.length > 0),
    )
    console.log(`✅ Images ready for renaming: ${renameable.length}`)

    if (renameable.length > 0) {
      console.log('\n📝 Sample renames:')
      for (const img of renameable.slice(0, 10)) {
        const extension = path.extname(img.url)
        const newFileName = this.generateNewFileName(
          img.barometers,
          img.manufacturers,
          img.categories,
          img.documents,
          extension,
          img.id,
        )

        let type = 'Unknown'
        if (img.barometers.length > 0) type = 'Barometer'
        else if (img.manufacturers.length > 0) type = 'Manufacturer'
        else if (img.categories.length > 0) type = 'Category'
        else if (img.documents.length > 0) type = 'Document'

        console.log(`   ${img.url} → ${newFileName} (${type})`)
      }
    }
  }

  /**
   * Process all images for renaming
   */
  async processImages(): Promise<void> {
    const modeText = this.dryRun ? '🧪 DRY RUN: ' : '🚀 '
    const keepOldText = this.keepOld ? ' (keeping old files)' : ''
    console.log(`${modeText}Processing images${keepOldText}...\n`)

    const images = await this.getAllImages()
    const renameable = images.filter(
      img =>
        img.url.startsWith('gallery/') &&
        img.url.includes('-') && // UUID pattern check
        (img.barometers.length > 0 ||
          img.manufacturers.length > 0 ||
          img.categories.length > 0 ||
          img.documents.length > 0),
    )

    console.log(`Processing ${renameable.length} images...\n`)

    for (const [index, image] of renameable.entries()) {
      const extension = path.extname(image.url)
      const newFileName = this.generateNewFileName(
        image.barometers,
        image.manufacturers,
        image.categories,
        image.documents,
        extension,
        image.id,
      )

      let entityType = 'Unknown'
      let entityName = 'Unknown'
      if (image.barometers.length > 0) {
        entityType = 'Barometer'
        entityName = image.barometers[0].collectionId
      } else if (image.manufacturers.length > 0) {
        entityType = 'Manufacturer'
        entityName = image.manufacturers[0].slug || 'Unknown'
      } else if (image.categories.length > 0) {
        entityType = 'Category'
        entityName = image.categories[0].name
      } else if (image.documents.length > 0) {
        entityType = 'Document'
        entityName = image.documents[0].catalogueNumber
      }

      console.log(`[${index + 1}/${renameable.length}] Processing: ${entityType} ${entityName}`)
      console.log(`  ${image.url} → ${newFileName}`)

      const processedImage: ProcessedImage = {
        id: image.id,
        oldUrl: image.url,
        newUrl: newFileName,
        processed: false,
      }

      try {
        // Check if old file exists
        if (!(await this.fileExists(image.url))) {
          processedImage.error = 'Source file not found in MinIO'
          console.log(`  ❌ Source file not found: ${image.url}`)
          this.processedImages.push(processedImage)
          continue
        }

        // Check if new filename already exists
        if (await this.fileExists(newFileName)) {
          processedImage.error = 'Target file already exists'
          console.log(`  ⚠️  Target file already exists: ${newFileName}`)
          this.processedImages.push(processedImage)
          continue
        }

        // Copy file to new name
        if (!(await this.copyFile(image.url, newFileName))) {
          processedImage.error = 'Failed to copy file'
          this.processedImages.push(processedImage)
          continue
        }

        // Update database
        if (!(await this.updateImageUrl(image.id, newFileName))) {
          processedImage.error = 'Failed to update database'
          this.processedImages.push(processedImage)
          continue
        }

        // Delete old file
        if (!(await this.deleteOldFile(image.url))) {
          processedImage.error = 'Failed to delete old file'
          this.processedImages.push(processedImage)
          continue
        }

        processedImage.processed = true
        console.log(`  ✅ Success`)
      } catch (error) {
        processedImage.error = error instanceof Error ? error.message : 'Unknown error'
        console.log(`  ❌ Error: ${processedImage.error}`)
      }

      this.processedImages.push(processedImage)
    }

    this.printSummary()
  }

  /**
   * Clean up orphaned files
   */
  async cleanupOrphanedFiles(): Promise<void> {
    console.log(`${this.dryRun ? '🧪 DRY RUN: ' : '🧹 '}Cleaning up orphaned files...\n`)

    const images = await this.getAllImages()
    const minioFiles = await this.getAllMinioFiles()

    const dbUrls = new Set(images.map(img => img.url))
    const orphanedFiles = minioFiles.filter(file => !dbUrls.has(file))

    if (orphanedFiles.length === 0) {
      console.log('✅ No orphaned files found')
      return
    }

    console.log(`Found ${orphanedFiles.length} orphaned files`)

    if (this.dryRun) {
      console.log('\nFiles that would be deleted:')
      for (const file of orphanedFiles) {
        console.log(`  - ${file}`)
      }
      return
    }

    // In production mode, ask for confirmation
    console.log('\n⚠️  WARNING: This will permanently delete files!')
    console.log('Orphaned files:')
    for (const file of orphanedFiles.slice(0, 10)) {
      console.log(`  - ${file}`)
    }
    if (orphanedFiles.length > 10) {
      console.log(`  ... and ${orphanedFiles.length - 10} more`)
    }

    // For safety, we'll just log what would be deleted
    console.log('\n🛡️  For safety, orphaned file cleanup is disabled in this script.')
    console.log('Please review the list above and delete manually if needed.')
  }

  /**
   * Print processing summary
   */
  private printSummary(): void {
    const successful = this.processedImages.filter(img => img.processed).length
    const failed = this.processedImages.filter(img => !img.processed).length

    console.log('\n📊 SUMMARY')
    console.log(`✅ Successfully processed: ${successful}`)
    console.log(`❌ Failed: ${failed}`)

    if (failed > 0) {
      console.log('\nFailed images:')
      for (const img of this.processedImages.filter(img => !img.processed)) {
        console.log(`  - ${img.oldUrl}: ${img.error}`)
      }
    }

    if (successful > 0) {
      console.log('\nProcessed images array:')
      console.log(
        JSON.stringify(
          this.processedImages
            .filter(img => img.processed)
            .map(img => ({
              id: img.id,
              oldUrl: img.oldUrl,
              newUrl: img.newUrl,
            })),
          null,
          2,
        ),
      )
    }
  }

  async cleanup(): Promise<void> {
    // No cleanup needed when using withPrisma
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  const command = args[0] || 'analyze'
  const dryRun = !args.includes('--execute')
  const keepOld = args.includes('--keep-old')

  const renamer = new ImageRenamer(dryRun, keepOld)

  try {
    switch (command) {
      case 'analyze':
        await renamer.analyze()
        break

      case 'rename':
        if (dryRun) {
          console.log('🧪 DRY RUN MODE - No changes will be made')
          console.log('Use --execute flag to perform actual changes\n')
        }
        await renamer.processImages()
        break

      case 'cleanup':
        await renamer.cleanupOrphanedFiles()
        break

      default:
        console.log('Usage:')
        console.log('  bun run scripts/rename-images.ts analyze')
        console.log('  bun run scripts/rename-images.ts rename [--execute] [--keep-old]')
        console.log('  bun run scripts/rename-images.ts cleanup [--execute]')
        console.log('')
        console.log('Commands:')
        console.log('  analyze  - Analyze current state without making changes')
        console.log('  rename   - Rename images (dry-run by default)')
        console.log('  cleanup  - Clean up orphaned files (dry-run by default)')
        console.log('')
        console.log('Options:')
        console.log('  --execute   - Actually perform changes (default is dry-run)')
        console.log(
          '  --keep-old  - Keep old files after copying to new names (safer for static sites)',
        )
        process.exit(1)
    }
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await renamer.cleanup()
  }
}

if (import.meta.main) {
  main()
}
