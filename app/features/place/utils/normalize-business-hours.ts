interface OriginalTimeInfo {
  day: number
  hour: number
  minute: number
}

interface OriginalBusinessPeriod {
  open: OriginalTimeInfo
  close?: OriginalTimeInfo
}

export interface OriginalBusinessHours {
  periods: OriginalBusinessPeriod[]
}

interface NormalizedBusinessPeriod {
  day: number // 0-6 (日曜日-土曜日)
  start: number // 分単位での開始時間 (0-1439)
  end: number // 分単位での終了時間 (0-2879)
}

type NormalizedWeeklyHours = NormalizedBusinessPeriod[]

export interface NormalizedBusinessHours {
  weeklyHours: NormalizedWeeklyHours
  is24HoursOpen: boolean
}

export const normalizeBusinessHours = (
  original: OriginalBusinessHours,
): NormalizedBusinessHours => {
  const weeklyHours: NormalizedWeeklyHours = []
  let is24HoursOpen = false
  if (original.periods.length > 0 && original.periods[0]?.close === undefined) {
    is24HoursOpen = true
  }

  for (const period of original.periods) {
    if (period.close === undefined) {
      continue
    }
    const startMinutes = period.open.hour * 60 + period.open.minute
    let endMinutes = period.close.hour * 60 + period.close.minute

    // 日をまたぐ場合の処理
    if (period.close.day !== period.open.day) {
      endMinutes += 1440 // 24時間を加算
    }

    // 24時間営業の検出
    if (startMinutes === 0 && endMinutes === 1440) {
      is24HoursOpen = true
    }

    weeklyHours.push({
      day: period.open.day,
      start: startMinutes,
      end: endMinutes,
    })
  }

  // 営業時間の重複を除去し、ソートする
  const sortedUniqueHours = removeDuplicatesAndSort(weeklyHours)

  return {
    weeklyHours: sortedUniqueHours,
    is24HoursOpen,
  }
}

const removeDuplicatesAndSort = (
  hours: NormalizedWeeklyHours,
): NormalizedWeeklyHours => {
  // 日付でソートし、重複を除去する
  return hours
    .sort((a, b) => a.day - b.day || a.start - b.start)
    .filter(
      (period, index, self) =>
        index === 0 ||
        period.start > self[index - 1].end ||
        period.day !== self[index - 1].day,
    )
}
