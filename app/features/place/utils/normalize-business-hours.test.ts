import { describe, expect, test } from 'vitest'
import {
  normalizeBusinessHours,
  type NormalizedBusinessHours,
  type OriginalBusinessHours,
} from './normalize-business-hours'

describe('normalizeBusinessHours', () => {
  test('正常な営業時間を正しく正規化する', () => {
    const input: OriginalBusinessHours = {
      periods: [
        {
          open: { day: 1, hour: 9, minute: 0 },
          close: { day: 1, hour: 17, minute: 0 },
        },
        {
          open: { day: 2, hour: 9, minute: 0 },
          close: { day: 2, hour: 17, minute: 0 },
        },
      ],
    }

    const expected: NormalizedBusinessHours = {
      weeklyHours: [
        { day: 1, start: 540, end: 1020 },
        { day: 2, start: 540, end: 1020 },
      ],
      is24HoursOpen: false,
    }

    expect(normalizeBusinessHours(input)).toEqual(expected)
  })

  test('日をまたぐ営業時間を正しく処理する', () => {
    const input: OriginalBusinessHours = {
      periods: [
        {
          open: { day: 5, hour: 22, minute: 0 },
          close: { day: 6, hour: 2, minute: 0 },
        },
      ],
    }

    const expected: NormalizedBusinessHours = {
      weeklyHours: [
        { day: 5, start: 1320, end: 1560 }, // 22:00 to 26:00 (翌日の2:00)
      ],
      is24HoursOpen: false,
    }

    expect(normalizeBusinessHours(input)).toEqual(expected)
  })

  test('同じ曜日内で複数の営業時間帯（昼と夜）を正しく処理する', () => {
    const input: OriginalBusinessHours = {
      periods: [
        {
          open: { day: 1, hour: 11, minute: 30 },
          close: { day: 1, hour: 14, minute: 0 },
        },
        {
          open: { day: 1, hour: 17, minute: 0 },
          close: { day: 1, hour: 22, minute: 0 },
        },
        {
          open: { day: 2, hour: 11, minute: 30 },
          close: { day: 2, hour: 14, minute: 0 },
        },
        {
          open: { day: 2, hour: 17, minute: 0 },
          close: { day: 2, hour: 22, minute: 0 },
        },
        {
          open: { day: 3, hour: 11, minute: 30 },
          close: { day: 3, hour: 14, minute: 0 },
        },
        {
          open: { day: 3, hour: 17, minute: 0 },
          close: { day: 3, hour: 22, minute: 0 },
        },
        {
          open: { day: 4, hour: 11, minute: 30 },
          close: { day: 4, hour: 14, minute: 0 },
        },
        {
          open: { day: 4, hour: 17, minute: 0 },
          close: { day: 4, hour: 22, minute: 0 },
        },
        {
          open: { day: 5, hour: 11, minute: 30 },
          close: { day: 5, hour: 14, minute: 0 },
        },
        {
          open: { day: 5, hour: 17, minute: 0 },
          close: { day: 5, hour: 22, minute: 0 },
        },
        {
          open: { day: 6, hour: 11, minute: 30 },
          close: { day: 6, hour: 22, minute: 0 },
        },
        {
          open: { day: 0, hour: 11, minute: 30 },
          close: { day: 0, hour: 22, minute: 0 },
        },
      ],
    }

    const expected: NormalizedBusinessHours = {
      weeklyHours: [
        { day: 0, start: 690, end: 1320 }, // Sunday: 11:30-22:00
        { day: 1, start: 690, end: 840 }, // Monday: 11:30-14:00
        { day: 1, start: 1020, end: 1320 }, // Monday: 17:00-22:00
        { day: 2, start: 690, end: 840 }, // Tuesday: 11:30-14:00
        { day: 2, start: 1020, end: 1320 }, // Tuesday: 17:00-22:00
        { day: 3, start: 690, end: 840 }, // Wednesday: 11:30-14:00
        { day: 3, start: 1020, end: 1320 }, // Wednesday: 17:00-22:00
        { day: 4, start: 690, end: 840 }, // Thursday: 11:30-14:00
        { day: 4, start: 1020, end: 1320 }, // Thursday: 17:00-22:00
        { day: 5, start: 690, end: 840 }, // Friday: 11:30-14:00
        { day: 5, start: 1020, end: 1320 }, // Friday: 17:00-22:00
        { day: 6, start: 690, end: 1320 }, // Saturday: 11:30-22:00
      ],
      is24HoursOpen: false,
    }

    expect(normalizeBusinessHours(input)).toEqual(expected)
  })

  test('同じ曜日内で複数の営業時間帯と日をまたぐ営業時間を正しく処理する', () => {
    const input: OriginalBusinessHours = {
      periods: [
        {
          open: { day: 1, hour: 11, minute: 30 },
          close: { day: 1, hour: 14, minute: 0 },
        },
        {
          open: { day: 1, hour: 17, minute: 0 },
          close: { day: 2, hour: 2, minute: 0 },
        },
        {
          open: { day: 2, hour: 11, minute: 30 },
          close: { day: 2, hour: 14, minute: 0 },
        },
        {
          open: { day: 2, hour: 17, minute: 0 },
          close: { day: 3, hour: 2, minute: 0 },
        },
      ],
    }

    const expected: NormalizedBusinessHours = {
      weeklyHours: [
        { day: 1, start: 690, end: 840 }, // Monday: 11:30-14:00
        { day: 1, start: 1020, end: 1560 }, // Monday: 17:00 - Tuesday 02:00
        { day: 2, start: 690, end: 840 }, // Tuesday: 11:30-14:00
        { day: 2, start: 1020, end: 1560 }, // Tuesday: 17:00 - Wednesday 02:00
      ],
      is24HoursOpen: false,
    }

    expect(normalizeBusinessHours(input)).toEqual(expected)
  })

  test('24時間営業を正しく検出する', () => {
    const input: OriginalBusinessHours = {
      periods: [
        {
          open: { day: 0, hour: 0, minute: 0 },
          close: { day: 1, hour: 0, minute: 0 },
        },
      ],
    }

    const expected: NormalizedBusinessHours = {
      weeklyHours: [{ day: 0, start: 0, end: 1440 }],
      is24HoursOpen: true,
    }

    expect(normalizeBusinessHours(input)).toEqual(expected)
  })

  test('重複する営業時間を正しく処理する', () => {
    const input: OriginalBusinessHours = {
      periods: [
        {
          open: { day: 1, hour: 9, minute: 0 },
          close: { day: 1, hour: 17, minute: 0 },
        },
        {
          open: { day: 1, hour: 10, minute: 0 },
          close: { day: 1, hour: 18, minute: 0 },
        },
      ],
    }

    const expected: NormalizedBusinessHours = {
      weeklyHours: [
        { day: 1, start: 540, end: 1020 }, // 9:00 to 17:00
      ],
      is24HoursOpen: false,
    }

    expect(normalizeBusinessHours(input)).toEqual(expected)
  })

  test('複数の日の営業時間を正しくソートする', () => {
    const input: OriginalBusinessHours = {
      periods: [
        {
          open: { day: 2, hour: 9, minute: 0 },
          close: { day: 2, hour: 17, minute: 0 },
        },
        {
          open: { day: 1, hour: 9, minute: 0 },
          close: { day: 1, hour: 17, minute: 0 },
        },
        {
          open: { day: 3, hour: 9, minute: 0 },
          close: { day: 3, hour: 17, minute: 0 },
        },
      ],
    }

    const expected: NormalizedBusinessHours = {
      weeklyHours: [
        { day: 1, start: 540, end: 1020 },
        { day: 2, start: 540, end: 1020 },
        { day: 3, start: 540, end: 1020 },
      ],
      is24HoursOpen: false,
    }

    expect(normalizeBusinessHours(input)).toEqual(expected)
  })

  test('空の入力を正しく処理する', () => {
    const input: OriginalBusinessHours = {
      periods: [],
    }

    const expected: NormalizedBusinessHours = {
      weeklyHours: [],
      is24HoursOpen: false,
    }

    expect(normalizeBusinessHours(input)).toEqual(expected)
  })
})
