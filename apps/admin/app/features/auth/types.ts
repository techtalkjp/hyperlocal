import type { DB, Selectable } from '@hyperlocal/db'

export type SessionUser = {
  id: Selectable<DB['adminUsers']>['id']
  email: Selectable<DB['adminUsers']>['email']
  displayName: Selectable<DB['adminUsers']>['displayName']
  pictureUrl: Selectable<DB['adminUsers']>['pictureUrl']
  locale: Selectable<DB['adminUsers']>['locale']
  role: Selectable<DB['adminUsers']>['role']
}
