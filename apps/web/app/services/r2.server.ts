import { Client } from 'minio'

const bucket = process.env.R2_BUCKET_NAME

const client = new Client({
  endPoint: `${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  region: 'auto',
  accessKey: process.env.R2_ACCESS_KEY_ID,
  secretKey: process.env.R2_SECRET_ACCESS_KEY,
  useSSL: true,
})

export const put = async (key: string, body: Buffer) => {
  return await client.putObject(bucket, key, body)
}

export const get = async (key: string) => {
  return await client.getObject(bucket, key)
}
