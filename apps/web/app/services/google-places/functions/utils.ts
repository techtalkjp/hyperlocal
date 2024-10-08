/**
 * 軽度、緯度、半径からそれを囲むボックスを計算する
 * @param latitude
 * @param longitude
 * @param radius
 * @returns
 */
function calculateBoundingBox(
  latitude: number,
  longitude: number,
  radius: number,
) {
  const earthRadius = 6378137 // 地球の半径 (メートル)

  // 緯度1度の長さ（メートル）
  const latLength = 111320

  // 経度1度の長さ（メートル）
  const lonLength = Math.cos((latitude * Math.PI) / 180) * 111320

  // 緯度の変化量
  const deltaLat = radius / latLength

  // 経度の変化量
  const deltaLon = radius / lonLength

  // 四隅の座標を計算
  const high = {
    latitude: latitude + deltaLat,
    longitude: longitude + deltaLon,
  }

  const low = {
    latitude: latitude - deltaLat,
    longitude: longitude - deltaLon,
  }

  return { high, low }
}
