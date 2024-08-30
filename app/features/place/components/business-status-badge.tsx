import { match } from 'ts-pattern'
import { BusinessStatus } from '../utils'

export const BusinessStatusBadge = ({ status }: { status: BusinessStatus }) => {
  const statusLabel = match(status)
    .with(BusinessStatus.OPEN, () => (
      <span className="text-green-500">Open</span>
    ))
    .with(BusinessStatus.OPEN_CLOSING_SOON, () => (
      <span className="text-orange-500">Closing Soon</span>
    ))
    .with(BusinessStatus.CLOSED, () => (
      <span className="text-red-500">Closed</span>
    ))
    .with(BusinessStatus.CLOSED_OPENING_SOON, () => (
      <span className="text-orange-500">Opening Soon</span>
    ))
    .with(BusinessStatus.UNKNOWN, () => <span />)
    .exhaustive()

  return (
    <div className="flex-shrink-0 px-1 py-0.5 text-xs font-semibold">
      {statusLabel}
    </div>
  )
}
