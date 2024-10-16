import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type GooglePlace = {
    id: string;
    types: string;
    displayName: string;
    rating: number;
    userRatingCount: number;
    latitude: number;
    longitude: number;
    googleMapsUri: string;
    priceLevel: string | null;
    regularOpeningHours: string | null;
    reviews: string;
    photos: string;
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
    genres: Generated<string>;
    displayName: string;
    originalDisplayName: string;
    rating: number;
    userRatingCount: number;
    latitude: number;
    longitude: number;
    googleMapsUri: string;
    sourceUri: string | null;
    priceLevel: string | null;
    regularOpeningHours: string | null;
    reviews: string;
    photos: string;
    createdAt: Generated<string>;
    updatedAt: Generated<string>;
};
export type Place = {
    id: string;
    categories: Generated<string>;
    genres: Generated<string>;
    displayName: string;
    rating: number;
    userRatingCount: number;
    latitude: number;
    longitude: number;
    googleMapsUri: string;
    sourceUri: string | null;
    priceLevel: string | null;
    regularOpeningHours: string | null;
    reviews: string;
    photos: string;
    createdAt: Generated<string>;
    updatedAt: Generated<string>;
};
export type PlaceListing = {
    cityId: string;
    areaId: string;
    categoryId: string;
    rankingType: string;
    placeId: string;
    createdAt: Generated<string>;
    updatedAt: Generated<string>;
};
export type DB = {
    googlePlaces: GooglePlace;
    googlePlacesAreas: GooglePlaceArea;
    localizedPlaces: LocalizedPlace;
    placeListings: PlaceListing;
    places: Place;
};
