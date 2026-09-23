import type React from "react";
import { match } from "ts-pattern";
import { cn } from "~/libs/utils";
import { BusinessStatus, type BusinessStatusResult } from "@hyperlocal/google-place-api";

const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface BusinessStatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  statusResult: BusinessStatusResult;
}

export const BusinessStatusBadge = ({ statusResult, className }: BusinessStatusBadgeProps) => {
  const statusLabel = match(statusResult.status)
    .with(BusinessStatus.OPEN_24_HOURS, () => (
      <div className="text-success">
        <span className="font-semibold">Open</span>
        <span className="text-muted-foreground mx-0.5">⋅</span>
        <span>24 hours</span>
      </div>
    ))
    .with(BusinessStatus.OPEN, () => (
      <div>
        <span className="font-semibold text-success">Open</span>
        <span className="text-muted-foreground mx-0.5">⋅</span>
        <span className="text-muted-foreground">
          until {weekday[statusResult.details.closingDay ?? 0]} {statusResult.details.closingTime}
        </span>
      </div>
    ))
    .with(BusinessStatus.OPEN_CLOSING_SOON, () => (
      <div>
        <span className="font-semibold text-warning">Closing Soon</span>
        <span className="text-muted-foreground mx-0.5">⋅</span>
        <span className="text-muted-foreground">
          at {weekday[statusResult.details.closingDay ?? 0]} {statusResult.details.closingTime}
        </span>
      </div>
    ))
    .with(BusinessStatus.CLOSED, () => (
      <div>
        <span className="font-semibold text-destructive">Closed</span>
        <span className="text-muted-foreground mx-0.5">⋅</span>
        <span className="text-muted-foreground">
          open at {weekday[statusResult.details.nextOpenDay ?? 0]}{" "}
          {statusResult.details.nextOpenTime}
        </span>
      </div>
    ))
    .with(BusinessStatus.CLOSED_OPENING_SOON, () => (
      <div>
        <span className="font-semibold text-warning">Opening Soon</span>
        <span className="text-muted-foreground mx-0.5">⋅</span>
        <span className="text-muted-foreground">at {statusResult.details.nextOpenTime}</span>
      </div>
    ))
    .with(BusinessStatus.UNKNOWN, () => <span />)
    .exhaustive();

  return <div className={cn("shrink-0", className)}>{statusLabel}</div>;
};
