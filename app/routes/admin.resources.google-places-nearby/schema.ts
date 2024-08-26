import { z } from 'zod'

export const schema = z.object({
  cityId: z.string(),
  areaId: z.string(),
  categoryId: z.string(),
  radius: z.number().optional().default(400),
  rankPreference: z
    .enum(['POPULARITY', 'DISTANCE'])
    .optional()
    .default('POPULARITY'),
})
