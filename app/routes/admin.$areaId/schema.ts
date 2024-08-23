import { z } from 'zod'

export const nearBySchema = z.object({
  intent: z.literal('nearby'),
  categoryId: z.string().optional(),
  radius: z.number().optional().default(400),
  rankPreference: z
    .enum(['POPULARITY', 'DISTANCE'])
    .optional()
    .default('POPULARITY'),
})

export const schema = z.discriminatedUnion('intent', [nearBySchema])
