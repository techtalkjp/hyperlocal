import { z } from 'zod'

export const nearBySchema = z.object({
  intent: z.literal('nearby'),
  primaryType: z.string().optional(),
  radius: z.number().optional().default(160),
  minRating: z.number().optional(),
})

export const textQuerySchema = z.object({
  intent: z.literal('textQuery'),
  query: z.string(),
  radius: z.number().optional().default(160),
  minRating: z.number().optional(),
  rankPreference: z.string().optional(),
})

export const schema = z.discriminatedUnion('intent', [
  nearBySchema,
  textQuerySchema,
])
