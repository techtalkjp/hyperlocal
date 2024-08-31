import { match } from 'ts-pattern'
import { BusinessStatus, type BusinessStatusResult } from '../utils'

const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const BusinessStatusBadge = ({
  statusResult,
}: {
  statusResult: BusinessStatusResult
}) => {
  const statusLabel = match(statusResult.status)
    .with(BusinessStatus.OPEN, () => (
      <>
        <span className="font-semibold text-green-600">Open</span>・
        <span className="ml-1 text-muted-foreground">
          {statusResult.details.currentHours}
        </span>
      </>
    ))
    .with(BusinessStatus.OPEN_CLOSING_SOON, () => (
      <>
        <span className="font-semibold text-orange-600">Closing Soon</span>・
        <span className="ml-1 text-muted-foreground">
          Close at {statusResult.details.closingTime}
        </span>
      </>
    ))
    .with(BusinessStatus.CLOSED, () => (
      <>
        <span className="font-semibold text-red-600">Closed</span>・
        <span className="ml-1 text-muted-foreground">
          Open at {weekday[statusResult.details.nextOpenDay ?? 0]}{' '}
          {statusResult.details.nextOpenTime}
        </span>
      </>
    ))
    .with(BusinessStatus.CLOSED_OPENING_SOON, () => (
      <>
        <span className="font-semibold text-orange-500">Opening Soon</span>・
        <span className="ml-1 text-muted-foreground">
          Open at {statusResult.details.nextOpenTime}
        </span>
      </>
    ))
    .with(BusinessStatus.UNKNOWN, () => <span />)
    .exhaustive()

  return <div className="my-1 flex-shrink-0 text-xs">{statusLabel}</div>
}
