import dayjs from '~/libs/dayjs'
import { normalizeBusinessHours } from './normalize-business-hours'

interface TimeInfo {
  day: number
  hour: number
  minute: number
}

interface Period {
  open: TimeInfo
  close?: TimeInfo // for 24-hour business
}

interface BusinessHours {
  periods: Period[]
}

enum BusinessStatus {
  OPEN = 'OPEN',
  OPEN_CLOSING_SOON = 'OPEN_CLOSING_SOON',
  CLOSED = 'CLOSED',
  CLOSED_OPENING_SOON = 'CLOSED_OPENING_SOON',
  UNKNOWN = 'UNKNOWN',
}

export interface BusinessStatusResult {
  status: BusinessStatus
  details: {
    closingDay?: number
    closingTime?: string
    nextOpenDay?: number
    nextOpenTime?: string
  }
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

function getBusinessStatus(
  originalBusinessHours: BusinessHours | null,
  currentDate: Date,
  timeZone: string,
): BusinessStatusResult {
  if (!originalBusinessHours) {
    return { status: BusinessStatus.UNKNOWN, details: {} }
  }

  const businessHours = normalizeBusinessHours(originalBusinessHours)

  if (businessHours.is24HoursOpen) {
    return { status: BusinessStatus.OPEN, details: {} }
  }

  const localDateTime = dayjs(currentDate).tz(timeZone)
  const currentDay = localDateTime.day()
  const currentTimeInMinutes =
    localDateTime.hour() * 60 + localDateTime.minute()

  const todaysPeriods = businessHours.weeklyHours.filter(
    (period) => period.day === currentDay,
  )

  for (const period of todaysPeriods) {
    if (
      currentTimeInMinutes >= period.start &&
      currentTimeInMinutes < period.end
    ) {
      const currentHours = `${formatTime(period.start)}-${formatTime(period.end)}`
      const minutesUntilClosing = period.end - currentTimeInMinutes
      if (minutesUntilClosing <= 60) {
        return {
          status: BusinessStatus.OPEN_CLOSING_SOON,
          details: {
            closingDay: period.day,
            closingTime: formatTime(period.end),
          },
        }
      }
      return {
        status: BusinessStatus.OPEN,
        details: {
          closingDay: period.day,
          closingTime: formatTime(period.end),
        },
      }
    }
  }

  let nextOpeningTime: { day: number; start: number } | null = null
  const daysToCheck = 7

  for (let i = 0; i < daysToCheck; i++) {
    const checkDay = (currentDay + i) % 7
    const periodsForDay = businessHours.weeklyHours.filter(
      (period) => period.day === checkDay,
    )

    for (const period of periodsForDay) {
      if ((i === 0 && period.start > currentTimeInMinutes) || i > 0) {
        nextOpeningTime = { day: checkDay, start: period.start }
        break
      }
    }

    if (nextOpeningTime) break
  }

  if (!nextOpeningTime) {
    return { status: BusinessStatus.CLOSED, details: {} }
  }

  const minutesUntilOpening =
    ((nextOpeningTime.day - currentDay + 7) % 7) * 1440 +
    nextOpeningTime.start -
    currentTimeInMinutes

  const nextOpenDay = nextOpeningTime.day
  const nextOpenTime = formatTime(nextOpeningTime.start)

  if (minutesUntilOpening <= 60) {
    return {
      status: BusinessStatus.CLOSED_OPENING_SOON,
      details: { nextOpenTime },
    }
  }

  return {
    status: BusinessStatus.CLOSED,
    details: { nextOpenDay, nextOpenTime },
  }
}

export { BusinessStatus, getBusinessStatus, type BusinessHours }
