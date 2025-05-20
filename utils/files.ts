import fs from 'fs-extra'
import path from 'path'

const uploadRoot = path.join(process.cwd(), 'downloads')

/**
 * Generates a list of files for processing or upload
 * by recursively scanning the local 'downloads' directory structure.
 *
 * Useful for preparing files to be uploaded or indexed from disk.
 */
export async function* walk(dir: string): AsyncGenerator<string> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      yield* walk(fullPath)
    } else {
      // eslint-disable-next-line no-continue
      if (entry.name === '.DS_Store') continue
      yield path.relative(uploadRoot, fullPath).replace(/\\/g, '/')
    }
  }
}
