import { describe, expect, it } from 'vitest'
import {
  type BusinessHours,
  BusinessStatus,
  getBusinessStatus,
} from './get-business-status' // パスは実際のファイル構造に合わせて調整してください

describe('getBusinessStatus with timezone', () => {
  const businessHours: BusinessHours = {
    periods: [
      // 月曜日　（テスト対象)
      {
        open: { day: 1, hour: 11, minute: 0 },
        close: { day: 1, hour: 15, minute: 30 },
      },
      {
        open: { day: 1, hour: 17, minute: 30 },
        close: { day: 1, hour: 21, minute: 30 },
      },
      // 火曜日
      {
        open: { day: 2, hour: 11, minute: 0 },
        close: { day: 2, hour: 15, minute: 30 },
      },
      {
        open: { day: 2, hour: 17, minute: 30 },
        close: { day: 2, hour: 21, minute: 30 },
      },
      // 水曜日
      {
        open: { day: 3, hour: 11, minute: 0 },
        close: { day: 3, hour: 15, minute: 30 },
      },
      {
        open: { day: 3, hour: 17, minute: 30 },
        close: { day: 3, hour: 21, minute: 30 },
      },
      // 木曜日
      {
        open: { day: 4, hour: 11, minute: 0 },
        close: { day: 4, hour: 15, minute: 30 },
      },
      {
        open: { day: 4, hour: 17, minute: 30 },
        close: { day: 4, hour: 21, minute: 30 },
      },
      // 金曜日
      {
        open: { day: 5, hour: 11, minute: 0 },
        close: { day: 5, hour: 15, minute: 30 },
      },
      {
        open: { day: 5, hour: 17, minute: 30 },
        close: { day: 5, hour: 21, minute: 30 },
      },
      // 土曜日
      {
        open: { day: 6, hour: 11, minute: 0 },
        close: { day: 6, hour: 16, minute: 0 },
      },
      // 日曜日
      {
        open: { day: 0, hour: 11, minute: 0 },
        close: { day: 0, hour: 16, minute: 0 },
      },
    ],
  }

  const tokyoTz = 'Asia/Tokyo'

  it('営業中の場合（東京時間）', () => {
    const date = new Date('2024-08-26T10:00:00Z') // UTC 10:00, 東京 19:00
    expect(getBusinessStatus(businessHours, date, tokyoTz)).toStrictEqual({
      details: {
        closingDay: 1,
        closingTime: '21:30',
      },
      status: BusinessStatus.OPEN,
    })
  })

  it('もうすぐ閉店の場合（東京時間）', () => {
    const date = new Date('2024-08-26T12:00:00Z') // UTC 12:00, 東京 21:00
    expect(getBusinessStatus(businessHours, date, tokyoTz)).toStrictEqual({
      details: {
        closingDay: 1,
        closingTime: '21:30',
      },
      status: BusinessStatus.OPEN_CLOSING_SOON,
    })
  })

  it('閉店中の場合（東京時間）', () => {
    const date = new Date('2024-08-26T07:00:00Z') // UTC 07:00, 東京 16:00
    expect(getBusinessStatus(businessHours, date, tokyoTz)).toStrictEqual({
      details: {
        nextOpenDay: 1,
        nextOpenTime: '17:30',
      },
      status: BusinessStatus.CLOSED,
    })
  })

  it('もうすぐ開店の場合（東京時間）', () => {
    const date = new Date('2024-08-26T01:00:00Z') // UTC 01:00, 東京 10:00
    expect(getBusinessStatus(businessHours, date, tokyoTz)).toStrictEqual({
      details: {
        nextOpenDay: 1,
        nextOpenTime: '11:00',
      },
      status: BusinessStatus.CLOSED_OPENING_SOON,
    })
  })

  it('異なるタイムゾーンでのテスト（ニューヨーク時間）', () => {
    const nyTz = 'America/New_York'
    const date = new Date('2024-08-26T15:00:00Z') // UTC 15:00, NY 11:00
    expect(getBusinessStatus(businessHours, date, nyTz)).toStrictEqual({
      details: {
        closingDay: 1,
        closingTime: '15:30',
      },
      status: BusinessStatus.OPEN,
    })
  })

  it('日付変更線をまたぐ場合（フィジー時間）', () => {
    const fijiTz = 'Pacific/Fiji'
    const date = new Date('2024-08-26T11:00:00Z') // UTC 11:00, フィジー 23:00 (月曜日)
    expect(getBusinessStatus(businessHours, date, fijiTz)).toStrictEqual({
      details: {
        nextOpenDay: 2,
        nextOpenTime: '11:00',
      },
      status: BusinessStatus.CLOSED,
    })
  })

  it('24時間営業の場合', () => {
    const always24HoursOpen: BusinessHours = {
      periods: [{ open: { day: 0, hour: 0, minute: 0 } }],
    }

    const tokyoTz = 'Asia/Tokyo'
    const dates = [
      new Date('2024-08-26T00:00:00Z'), // 月曜日 00:00
      new Date('2024-08-26T12:00:00Z'), // 月曜日 12:00
      new Date('2024-08-27T23:59:59Z'), // 火曜日 23:59
    ]

    for (const date of dates) {
      expect(getBusinessStatus(always24HoursOpen, date, tokyoTz)).toStrictEqual(
        {
          details: {},
          status: BusinessStatus.OPEN_24_HOURS,
        },
      )
    }
  })

  it('通常の営業時間と24時間営業を区別できる', () => {
    const regularHours: BusinessHours = {
      periods: [
        {
          open: { day: 1, hour: 9, minute: 0 },
          close: { day: 1, hour: 17, minute: 0 },
        },
      ],
    }

    const always24HoursOpen: BusinessHours = {
      periods: [{ open: { day: 0, hour: 0, minute: 0 } }],
    }

    const tokyoTz = 'Asia/Tokyo'
    const date = new Date('2024-08-26T20:00:00Z') // 月曜日 20:00 UTC (火曜日 05:00 東京時間)

    expect(getBusinessStatus(regularHours, date, tokyoTz)).toStrictEqual({
      details: {
        nextOpenDay: 1,
        nextOpenTime: '09:00',
      },
      status: BusinessStatus.CLOSED,
    })
    expect(getBusinessStatus(always24HoursOpen, date, tokyoTz)).toStrictEqual({
      details: {},
      status: BusinessStatus.OPEN_24_HOURS,
    })
  })

  it('24時を超えた時間でのテスト', () => {
    const businessHours: BusinessHours = {
      periods: [
        {
          open: { day: 1, hour: 23, minute: 0 },
          close: { day: 2, hour: 8, minute: 0 },
        },
      ],
    }

    const tokyoTz = 'Asia/Tokyo'
    const date = new Date('2024-08-26T20:00:00Z') // 月曜日 20:00 UTC (火曜日 05:00 東京時間)

    expect(getBusinessStatus(businessHours, date, tokyoTz)).toStrictEqual({
      details: {
        closingDay: 2,
        closingTime: '08:00',
      },
      status: BusinessStatus.OPEN,
    })
  })
})
