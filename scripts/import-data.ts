import { exec, spawn } from 'node:child_process'
import path from 'node:path'
import { promisify } from 'node:util'
import dotenv from 'dotenv'
import { pathExists, remove } from 'fs-extra'

const execAsync = promisify(exec)

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') })

const {
  REMOTE_HOST,
  REMOTE_USER = 'ubuntu',
  REMOTE_DB_IP,
  REMOTE_DB_USER,
  REMOTE_DB_PASSWORD,
  REMOTE_DB_NAME,
} = process.env

if (!REMOTE_HOST || !REMOTE_DB_IP || !REMOTE_DB_USER || !REMOTE_DB_PASSWORD || !REMOTE_DB_NAME) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const LOCAL_DB = 'barometers_local'
const DUMP_FILE = `temp_dump_${new Date().toISOString().replace(/[:T]/g, '-').split('.')[0]}.sql`

// Main execution
try {
  console.log('🗄️  Importing data from remote database...')

  console.log('🔌 Killing existing SSH tunnels...')
  try {
    await execAsync(`pkill -f "ssh.*${REMOTE_DB_IP}:5432"`)
  } catch {
    // Ignore if no tunnels to kill
  }
  await new Promise(resolve => setTimeout(resolve, 2000))

  console.log('📡 Opening SSH tunnel on port 5433...')
  spawn('ssh', ['-fN', '-L', `5433:${REMOTE_DB_IP}:5432`, `${REMOTE_USER}@${REMOTE_HOST}`])
  await new Promise(resolve => setTimeout(resolve, 3000)) // Wait for tunnel

  console.log('💾 Creating database dump...')
  console.log(`Connecting to remote database: ${REMOTE_DB_NAME} as user: ${REMOTE_DB_USER}`)
  const env = { ...process.env, PGPASSWORD: REMOTE_DB_PASSWORD }
  await execAsync(
    `/opt/homebrew/opt/libpq/bin/pg_dump -h localhost -p 5433 -U "${REMOTE_DB_USER}" "${REMOTE_DB_NAME}" --clean --no-owner --no-privileges > "${DUMP_FILE}"`,
    { env },
  )

  console.log('🔄 Restoring to local database...')
  await execAsync(`psql -d "${LOCAL_DB}" < "${DUMP_FILE}"`)

  console.log('✅ Data import complete!')
  console.log('🚀 You can now run: npm run dev')
} catch (error) {
  console.error('❌ Import failed:', error)
  process.exit(1)
} finally {
  console.log('🧹 Cleaning up...')

  // Kill SSH tunnel
  try {
    await execAsync(`pkill -f "ssh.*${REMOTE_DB_IP}:5432"`)
  } catch {
    // Ignore if no tunnels to kill
  }

  // Remove dump file
  if (await pathExists(DUMP_FILE)) {
    await remove(DUMP_FILE)
  }
}
