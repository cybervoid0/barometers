/* eslint-disable no-console */
import { exec } from 'child_process'
import { ensureDirSync } from 'fs-extra'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '.env') })

const url = process.env.DATABASE_URL
if (!url) throw new Error('No DATABASE_URL in .env')

ensureDirSync('backups')

const time = new Date().toISOString().replace(/[:T]/g, '-').split('.')[0]
const projectRoot = path.resolve(__dirname)
const backupDir = path.join(projectRoot, 'backups')
const file = path.join(backupDir, `backup_${time}.dump`)

exec(`/opt/homebrew/opt/libpq/bin/pg_dump "${url}" -F p -f "${file.replace('.dump', '.sql')}"`, e =>
  console.log(
    e
      ? `❌ Error: Unable to create Barometers DB dump. ${e instanceof Error ? e.message : e}`
      : `✅ Barometers DB dump saved to ${file}`,
  ),
)
