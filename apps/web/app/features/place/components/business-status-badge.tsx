import { match } from 'ts-pattern'
import { BusinessStatus, type BusinessStatusResult } from '../utils'

const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const BusinessStatusBadge = ({
  statusResult,
}: {
  statusResult: BusinessStatusResult
}) => {
  const statusLabel = match(statusResult.status)
    .with(BusinessStatus.OPEN_24_HOURS, () => (
      <div className="text-green-600">
        <span className="font-semibold">Open</span>
        <span className="mx-0.5 text-muted-foreground">⋅</span>
        <span>24 hours</span>
      </div>
    ))
    .with(BusinessStatus.OPEN, () => (
      <div>
        <span className="font-semibold text-green-600">Open</span>
        <span className="mx-0.5 text-muted-foreground">⋅</span>
        <span className="text-muted-foreground">
          until {weekday[statusResult.details.closingDay ?? 0]}{' '}
          {statusResult.details.closingTime}
        </span>
      </div>
    ))
    .with(BusinessStatus.OPEN_CLOSING_SOON, () => (
      <div>
        <span className="font-semibold text-orange-600">Closing Soon</span>
        <span className="mx-0.5 text-muted-foreground">⋅</span>
        <span className="text-muted-foreground">
          at {weekday[statusResult.details.closingDay ?? 0]}{' '}
          {statusResult.details.closingTime}
        </span>
      </div>
    ))
    .with(BusinessStatus.CLOSED, () => (
      <div>
        <span className="font-semibold text-red-600">Closed</span>
        <span className="mx-0.5 text-muted-foreground">⋅</span>
        <span className="text-muted-foreground">
          open at {weekday[statusResult.details.nextOpenDay ?? 0]}{' '}
          {statusResult.details.nextOpenTime}
        </span>
      </div>
    ))
    .with(BusinessStatus.CLOSED_OPENING_SOON, () => (
      <div>
        <span className="font-semibold text-orange-500">Opening Soon</span>
        <span className="mx-0.5 text-muted-foreground">⋅</span>
        <span className="text-muted-foreground">
          at {statusResult.details.nextOpenTime}
        </span>
      </div>
    ))
    .with(BusinessStatus.UNKNOWN, () => <span />)
    .exhaustive()

  return <div className="my-1 flex-shrink-0 text-xs">{statusLabel}</div>
}
