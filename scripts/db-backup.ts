import { exec } from 'node:child_process'
import path from 'node:path'
import dotenv from 'dotenv'
import { ensureDirSync } from 'fs-extra'

dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

const url = process.env.REMOTE_DATABASE_URL
if (!url) throw new Error('No DATABASE_URL in .env')

ensureDirSync('backups')

const time = new Date().toISOString().replace(/[:T]/g, '-').split('.')[0]
const projectRoot = path.resolve(__dirname, '..')
const backupDir = path.join(projectRoot, 'backups')
const file = path.join(backupDir, `backup_${time}.dump`)

exec(`/opt/homebrew/opt/libpq/bin/pg_dump "${url}" -F c -f "${file}"`, e =>
  console.log(
    e
      ? `❌ Error: Unable to create Barometers DB dump. ${e instanceof Error ? e.message : e}`
      : `✅ Barometers DB dump saved to ${file}`,
  ),
)
