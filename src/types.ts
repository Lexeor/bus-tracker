/**
 * Coordinate tuple [latitude, longitude]
 */
export type Coordinates = [number, number];

/**
 * Geolocation position options
 */
export interface GeolocationConfig {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
}

/**
 * Line/Route structure
 * Replace 'any' with actual types from your project
 */
export interface Line {
  id: string;
  name: string;
  color: string;
  stops: Stop[];
  // Add other properties as needed
}

/**
 * Stop structure
 * Define according to your actual data structure
 */
export interface Stop {
  id: string;
  name: string;
  coordinates: Coordinates;
  // Add other properties as needed
}

/**
 * Route coordinates store type
 */
export interface RouteCoordinates {
  [key: string]: any; // Define more specific type based on your implementation
}

/**
 * Safe area inset values
 */
export interface SafeAreaInsets {
  top: string;
  right: string;
  bottom: string;
  left: string;
}
