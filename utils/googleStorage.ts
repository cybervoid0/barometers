import { Storage } from '@google-cloud/storage'

const decodedPrivateKey = Buffer.from(process.env.GCP_PRIVATE_KEY!, 'base64').toString('utf-8')
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    private_key: decodedPrivateKey,
  },
})
const bucket = storage.bucket(process.env.GCP_BUCKET_NAME!)

export default bucket
