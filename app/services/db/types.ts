import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type GooglePlace = {
    id: string;
    name: string;
    types: string;
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
    cityId: string;
    areaId: string;
    categoryId: string;
    createdAt: Generated<string>;
    updatedAt: Generated<string>;
};
export type LocalizedPlace = {
    cityId: string;
    areaId: string;
    categoryId: string;
    placeId: string;
    language: string;
    name: string;
    description: string;
    rating: number;
    userRatingCount: number;
    latitude: number;
    longitude: number;
    types: string;
    reviews: string;
    photos: string;
    createdAt: Generated<string>;
    updatedAt: Generated<string>;
};
export type DB = {
    googlePlaces: GooglePlace;
    googlePlacesAreas: GooglePlaceArea;
    localizedPlaces: LocalizedPlace;
};
