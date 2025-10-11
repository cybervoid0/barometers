import { exec, spawn } from 'node:child_process'
import path from 'node:path'
import { promisify } from 'node:util'
import dotenv from 'dotenv'

const execAsync = promisify(exec)

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') })

const { REMOTE_HOST, REMOTE_USER = 'ubuntu', REMOTE_DB_IP, REMOTE_DATABASE_URL } = process.env

if (!REMOTE_HOST || !REMOTE_DB_IP || !REMOTE_DATABASE_URL) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const command = process.argv.slice(2)

if (command.length === 0) {
  console.error('❌ No command provided')
  console.error('Usage: bun tunnel.ts <command>')
  process.exit(1)
}

let tunnelCreatedByThisScript = false

// Check if tunnel is already running
try {
  await execAsync(`pgrep -f "ssh.*${REMOTE_DB_IP}:5432"`)
  console.log('✅ SSH tunnel already running')
} catch {
  console.log(`⏳ Opening SSH tunnel to ${REMOTE_HOST}...`)
  spawn('ssh', ['-fN', '-L', `5433:${REMOTE_DB_IP}:5432`, `${REMOTE_USER}@${REMOTE_HOST}`])
  tunnelCreatedByThisScript = true

  // Wait for tunnel to establish
  await new Promise(resolve => setTimeout(resolve, 5000))
}

// Cleanup function
const cleanup = async () => {
  if (tunnelCreatedByThisScript) {
    console.log('🧹 Cleaning up SSH tunnel...')
    try {
      await execAsync(`pkill -f "ssh.*${REMOTE_DB_IP}:5432"`)
    } catch {
      // Ignore if tunnel already closed
    }
  }
}

// Set up cleanup on exit
process.on('exit', cleanup)
process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)

try {
  console.log(`🚀 Executing: ${command.join(' ')}`)

  // Set DATABASE_URL to remote for the command
  const env = { ...process.env, DATABASE_URL: REMOTE_DATABASE_URL }

  // Execute the command
  const child = spawn(command[0], command.slice(1), {
    stdio: 'inherit',
    env,
  })

  // Wait for command to complete
  const exitCode = await new Promise<number>(resolve => {
    child.on('close', resolve)
  })

  process.exit(exitCode)
} catch (error) {
  console.error('❌ Command failed:', error)
  process.exit(1)
}
