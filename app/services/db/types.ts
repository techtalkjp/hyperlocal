import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type Area = {
    id: string;
    name: string;
    longitude: number;
    latitude: number;
    createdAt: Generated<string>;
    updatedAt: Generated<string>;
};
export type GooglePlace = {
    id: string;
    name: string;
    types: string;
    primaryType: string;
    rating: number;
    userRatingCount: number;
    latitude: number;
    longitude: number;
    displayName: string;
    raw: string;
    createdAt: Generated<string>;
    updatedAt: Generated<string>;
};
export type GooglePlaceArea = {
    googlePlaceId: string;
    areaId: string;
    createdAt: Generated<string>;
    updatedAt: Generated<string>;
};
export type DB = {
    areas: Area;
    googlePlaces: GooglePlace;
    googlePlacesAreas: GooglePlaceArea;
};
