import { TZDate } from '@date-fns/tz'

interface BusinessHoursPeriod {
  open: {
    day: number // 週の開始からの日数 (0-6)
    hour: number // 時間 (0-23)
    minute: number // 分 (0-59)
  }
  close?: {
    day: number // 週の開始からの日数 (0-6)
    hour: number // 時間 (0-23)
    minute: number // 分 (0-59)
  }
}

interface NormalizeBusinessHoursPeriod {
  start: number // 週の開始からの分数 (0-10079)
  end: number // 週の開始からの分数 (0-10079)
}

interface BusinessHours {
  periods: BusinessHoursPeriod[]
}

enum BusinessStatus {
  OPEN = 'OPEN',
  OPEN_CLOSING_SOON = 'OPEN_CLOSING_SOON',
  OPEN_24_HOURS = 'OPEN_24_HOURS',
  CLOSED = 'CLOSED',
  CLOSED_OPENING_SOON = 'CLOSED_OPENING_SOON',
  UNKNOWN = 'UNKNOWN',
}

interface BusinessStatusResult {
  status: BusinessStatus
  details: {
    closingDay?: number
    closingTime?: string
    nextOpenDay?: number
    nextOpenTime?: string
  }
}

const WEEK_MINUTES = 7 * 24 * 60 // 10080 minutes in a week

function normalizeBusinessHours(
  originalHours: BusinessHours,
): NormalizeBusinessHoursPeriod[] {
  return originalHours.periods
    .map((period) => ({
      start:
        period.open.day * 24 * 60 + period.open.hour * 60 + period.open.minute,
      end: period.close
        ? (period.close.day * 24 * 60 +
            period.close.hour * 60 +
            period.close.minute +
            (period.close.day < period.open.day ? WEEK_MINUTES : 0)) %
          WEEK_MINUTES
        : WEEK_MINUTES,
    }))
    .sort((a, b) => a.start - b.start)
}

function formatMinutes(minutes: number) {
  const day = Math.floor(minutes / (24 * 60))
  const hour = Math.floor((minutes % (24 * 60)) / 60)
  const minute = minutes % 60
  return {
    day,
    time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
  }
}

function getBusinessStatus(
  businessHours: BusinessHours | null,
  currentDate: Date,
  timeZone: string,
): BusinessStatusResult {
  if (!businessHours) {
    return { status: BusinessStatus.UNKNOWN, details: {} }
  }

  if (businessHours.periods.length === 0) {
    return { status: BusinessStatus.UNKNOWN, details: {} }
  }

  if (businessHours.periods[0].close === undefined) {
    return { status: BusinessStatus.OPEN_24_HOURS, details: {} }
  }

  const normalizedHours = normalizeBusinessHours(businessHours)
  const localDateTime = new TZDate(currentDate, timeZone)
  let currentMinutes =
    localDateTime.getDay() * 24 * 60 +
    localDateTime.getHours() * 60 +
    localDateTime.getMinutes()

  // Adjust for week wrapping
  if (currentMinutes >= WEEK_MINUTES) {
    currentMinutes %= WEEK_MINUTES
  }

  for (let i = 0; i < normalizedHours.length; i++) {
    const period = normalizedHours[i]
    if (
      (period.start <= currentMinutes && currentMinutes < period.end) ||
      (period.start > period.end &&
        (currentMinutes >= period.start || currentMinutes < period.end))
    ) {
      // 営業中
      const minutesUntilClosing =
        (period.end - currentMinutes + WEEK_MINUTES) % WEEK_MINUTES
      if (minutesUntilClosing <= 60) {
        const { day: closingDay, time: closingTime } = formatMinutes(period.end)
        return {
          status: BusinessStatus.OPEN_CLOSING_SOON,
          details: {
            closingDay,
            closingTime,
          },
        }
      }
      const { day: closingDay, time: closingTime } = formatMinutes(period.end)
      return {
        status: BusinessStatus.OPEN,
        details: {
          closingDay,
          closingTime,
        },
      }
    }

    const minutesUntilOpening =
      (period.start - currentMinutes + WEEK_MINUTES) % WEEK_MINUTES
    if (minutesUntilOpening <= 60) {
      const { day: nextOpenDay, time: nextOpenTime } = formatMinutes(
        period.start,
      )
      // もうすぐ開店
      return {
        status: BusinessStatus.CLOSED_OPENING_SOON,
        details: {
          nextOpenDay,
          nextOpenTime,
        },
      }
    }
  }

  // 閉店中 - 次の営業開始時間を探す
  const nextPeriod = normalizedHours.find(
    (period) =>
      (period.start - currentMinutes + WEEK_MINUTES) % WEEK_MINUTES ===
      Math.min(
        ...normalizedHours.map(
          (p) => (p.start - currentMinutes + WEEK_MINUTES) % WEEK_MINUTES,
        ),
      ),
  )

  if (nextPeriod) {
    const { day: nextOpenDay, time: nextOpenTime } = formatMinutes(
      nextPeriod.start,
    )
    return {
      status: BusinessStatus.CLOSED,
      details: {
        nextOpenDay,
        nextOpenTime,
      },
    }
  }

  // ここに到達することはないはずですが、安全のため
  return { status: BusinessStatus.UNKNOWN, details: {} }
}

export {
  BusinessStatus,
  getBusinessStatus,
  type BusinessHours,
  type BusinessStatusResult,
}
