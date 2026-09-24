import type { Area } from "./consts/areas";

// 2点間の距離 (m)。haversine
export const distanceMeters = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

// エリアの掲載範囲内か。座標未取得 (0,0) は判定不能なので範囲内扱いにして落とさない
export const isWithinArea = (
  area: Pick<Area, "latitude" | "longitude" | "radius">,
  lat: number,
  lng: number,
) => {
  if (!lat || !lng) return true;
  return distanceMeters(area.latitude, area.longitude, lat, lng) <= area.radius;
};
