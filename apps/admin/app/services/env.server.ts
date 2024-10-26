import { z } from 'zod'

const envSchema = z.object({
  GOOGLE_MAPS_API_KEY: z.string(),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string(),
  TURSO_DATABASE_URL: z.string(),
  TURSO_AUTH_TOKEN: z.string(),
  DATABASE_URL: z.string(),
  SESSION_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
})

envSchema.parse(process.env)

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}
