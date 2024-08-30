import dayjs from '~/libs/dayjs'

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
  businessHours: BusinessHours | null,
  currentDate: Date,
  timeZone: string,
): BusinessStatus {
  if (!businessHours) {
    return BusinessStatus.UNKNOWN
  }

  // 24時間営業かどうかをチェック
  const is24HourService =
    businessHours.periods.length === 1 &&
    businessHours.periods[0].open.day === 0 &&
    businessHours.periods[0].open.hour === 0 &&
    businessHours.periods[0].open.minute === 0 &&
    !businessHours.periods[0].close

  if (is24HourService) {
    return BusinessStatus.OPEN // 24時間営業の場合は常にOPEN
  }

  // 指定されたタイムゾーンでの現地時間を取得
  const localDateTime = dayjs(currentDate).tz(timeZone)

  const currentDay = localDateTime.day()
  const currentTimeInMinutes =
    localDateTime.hour() * 60 + localDateTime.minute()

  const todayPeriods = businessHours.periods.filter(
    (period) => period.open.day === currentDay,
  )

  const isOpenNow = todayPeriods.some((period) => {
    const openTime = period.open.hour * 60 + period.open.minute
    const closeTime = period.close
      ? period.close.hour * 60 + period.close.minute
      : 1440 // closeがない場合は23:59とみなす
    return currentTimeInMinutes >= openTime && currentTimeInMinutes < closeTime
  })

  if (isOpenNow) {
    for (const period of todayPeriods) {
      if (period.close) {
        const closeTimeInMinutes = period.close.hour * 60 + period.close.minute
        const remainingMinutes = closeTimeInMinutes - currentTimeInMinutes
        if (remainingMinutes > 0 && remainingMinutes <= 60) {
          return BusinessStatus.OPEN_CLOSING_SOON
        }
      }
    }
    return BusinessStatus.OPEN
  }
  let nextOpenDay = currentDay
  let minWaitTime = Number.POSITIVE_INFINITY

  for (let i = 0; i < 7; i++) {
    const checkDay = ((currentDay + i) % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6
    const periodsForDay = businessHours.periods.filter(
      (period) => period.open.day === checkDay,
    )

    for (const period of periodsForDay) {
      const openTimeInMinutes = period.open.hour * 60 + period.open.minute
      let waitTime: number

      if (checkDay === currentDay && openTimeInMinutes > currentTimeInMinutes) {
        waitTime = openTimeInMinutes - currentTimeInMinutes
      } else if (checkDay !== currentDay) {
        waitTime =
          ((checkDay - currentDay + 7) % 7) * 24 * 60 +
          openTimeInMinutes -
          currentTimeInMinutes
      } else {
        continue
      }

      if (waitTime < minWaitTime) {
        minWaitTime = waitTime
        nextOpenDay = checkDay
      }
    }

    if (minWaitTime !== Number.POSITIVE_INFINITY) break
  }

  if (minWaitTime <= 60) {
    return BusinessStatus.CLOSED_OPENING_SOON
  }
  return BusinessStatus.CLOSED
}

export { BusinessStatus, getBusinessStatus, type BusinessHours }
