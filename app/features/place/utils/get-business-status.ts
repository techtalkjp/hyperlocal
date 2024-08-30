import dayjs from '~/libs/dayjs'

interface TimeInfo {
  day: number
  hour: number
  minute: number
}

interface Period {
  open: TimeInfo
  close: TimeInfo
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

  // 指定されたタイムゾーンでの現地時間を取得
  const localDateTime = dayjs(currentDate).tz(timeZone)

  const currentDay = localDateTime.day()
  const currentTimeInMinutes =
    localDateTime.hour() * 60 + localDateTime.minute()

  // 当日の営業時間を取得
  const todayPeriods = businessHours.periods.filter(
    (period) => period.open.day === currentDay,
  )

  // 営業中かどうかを判定
  const isOpenNow = todayPeriods.some((period) => {
    const openTime = period.open.hour * 60 + period.open.minute
    const closeTime = period.close.hour * 60 + period.close.minute
    return currentTimeInMinutes >= openTime && currentTimeInMinutes < closeTime
  })

  if (isOpenNow) {
    // 営業中の場合、閉店時間までの残り時間を計算
    for (const period of todayPeriods) {
      const closeTimeInMinutes = period.close.hour * 60 + period.close.minute
      const remainingMinutes = closeTimeInMinutes - currentTimeInMinutes
      if (remainingMinutes > 0 && remainingMinutes <= 60) {
        return BusinessStatus.OPEN_CLOSING_SOON
      }
    }
    return BusinessStatus.OPEN
  }
  // 閉店中の場合、次の開店時間までの待ち時間を計算
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
