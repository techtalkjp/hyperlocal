import type { Selectable } from 'kysely'
import type { DB } from './schema'

export type GooglePlace = Selectable<DB['googlePlaces']>
