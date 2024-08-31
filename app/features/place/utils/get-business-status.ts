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

function getBusinessStatus(
  originalBusinessHours: BusinessHours | null,
  currentDate: Date,
  timeZone: string,
): BusinessStatus {
  if (!originalBusinessHours) {
    return BusinessStatus.UNKNOWN
  }

  const businessHours = normalizeBusinessHours(originalBusinessHours)

  if (businessHours.is24HoursOpen) {
    return BusinessStatus.OPEN
  }

  const localDateTime = dayjs(currentDate).tz(timeZone)
  const currentDay = localDateTime.day()
  const currentTimeInMinutes =
    localDateTime.hour() * 60 + localDateTime.minute()

  // 現在の日の全ての営業時間枠を取得
  const todaysPeriods = businessHours.weeklyHours.filter(
    (period) => period.day === currentDay,
  )

  // 現在営業中かどうかをチェック
  for (const period of todaysPeriods) {
    if (
      currentTimeInMinutes >= period.start &&
      currentTimeInMinutes < period.end
    ) {
      const minutesUntilClosing = period.end - currentTimeInMinutes
      if (minutesUntilClosing <= 60) {
        return BusinessStatus.OPEN_CLOSING_SOON
      }
      return BusinessStatus.OPEN
    }
  }

  // 閉店中の場合、次の営業開始時間を探す
  let nextOpeningTime: { day: number; start: number } | null = null
  const daysToCheck = 7 // 最大1週間分チェック

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
    return BusinessStatus.CLOSED
  }

  const minutesUntilOpening =
    ((nextOpeningTime.day - currentDay + 7) % 7) * 1440 +
    nextOpeningTime.start -
    currentTimeInMinutes

  if (minutesUntilOpening <= 60) {
    return BusinessStatus.CLOSED_OPENING_SOON
  }

  return BusinessStatus.CLOSED
}
export { BusinessStatus, getBusinessStatus, type BusinessHours }
