import type { Area } from '@hyperlocal/consts'
import type { LocalizedPlace } from '@hyperlocal/db'

/**
 * 2点間の距離をヒュベニの公式で計算する（メートル単位）
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371000 // 地球の半径（メートル）

  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

export interface LocalizedPlaceWithDistance extends LocalizedPlace {
  distance: number
}

/**
 * 指定された位置からの距離でソートする
 */
export const sortLocalizedPlaceByDistance = (
  places: LocalizedPlace[],
  userLat: number,
  userLon: number,
): LocalizedPlaceWithDistance[] => {
  // 距離を計算して追加
  const placesWithDistance = places.map((restaurant) => ({
    ...restaurant,
    distance: calculateDistance(
      userLat,
      userLon,
      restaurant.latitude,
      restaurant.longitude,
    ),
  }))

  // 距離でソート
  placesWithDistance.sort((a, b) => a.distance - b.distance)
  return placesWithDistance
}

export interface AreaWithDistance extends Area {
  distance: number
}

/**
 * 指定された位置からの距離で areas をソートする
 */
export const sortAreasByDistance = (
  areas: Area[],
  userLat: number,
  userLon: number,
): AreaWithDistance[] => {
  // 距離を計算して追加
  const areasWithDistance = areas.map((area) => ({
    ...area,
    distance: calculateDistance(
      userLat,
      userLon,
      area.latitude,
      area.longitude,
    ),
  }))

  // 距離でソート
  areasWithDistance.sort((a, b) => a.distance - b.distance)
  return areasWithDistance
}
