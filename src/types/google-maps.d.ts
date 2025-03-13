// Type definitions for Google Maps JavaScript API
declare namespace google {
  namespace maps {
    namespace places {
      class AutocompleteService {
        getPlacePredictions(
          request: AutocompletionRequest,
          callback: (predictions: AutocompletePrediction[] | null, status: string) => void
        ): void;
      }

      class PlacesService {
        constructor(attrContainer: Element | Map);
        getDetails(
          request: { placeId: string },
          callback: (result: PlaceResult | null, status: string) => void
        ): void;
      }

      interface AutocompletePrediction {
        description: string;
        place_id: string;
        structured_formatting: {
          main_text: string;
          secondary_text: string;
          main_text_matched_substrings: Array<{
            length: number;
            offset: number;
          }>;
        };
        terms: Array<{
          offset: number;
          value: string;
        }>;
        types: string[];
      }

      interface AutocompletionRequest {
        input: string;
        types?: string[];
        componentRestrictions?: {
          country: string | string[];
        };
      }

      interface PlacesServiceStatus {
        OK: 'OK';
        ZERO_RESULTS: 'ZERO_RESULTS';
        OVER_QUERY_LIMIT: 'OVER_QUERY_LIMIT';
        REQUEST_DENIED: 'REQUEST_DENIED';
        INVALID_REQUEST: 'INVALID_REQUEST';
        UNKNOWN_ERROR: 'UNKNOWN_ERROR';
        NOT_FOUND: 'NOT_FOUND';
      }

      const PlacesServiceStatus: PlacesServiceStatus;

      interface PlaceResult {
        place_id: string;
        formatted_address: string;
        geometry: {
          location: LatLng;
          viewport: LatLngBounds;
        };
        address_components: AddressComponent[];
        name?: string;
      }
    }

    class Geocoder {
      geocode(
        request: { placeId: string } | { address: string },
        callback: (
          results: GeocoderResult[] | null,
          status: string
        ) => void
      ): void;
    }

    interface GeocoderResult {
      address_components: AddressComponent[];
      formatted_address: string;
      geometry: {
        location: LatLng;
        location_type: string;
        viewport: LatLngBounds;
      };
      place_id: string;
      types: string[];
    }

    interface AddressComponent {
      long_name: string;
      short_name: string;
      types: string[];
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    class LatLngBounds {
      constructor(sw: LatLng, ne: LatLng);
      getSouthWest(): LatLng;
      getNorthEast(): LatLng;
    }

    class Map {
      constructor(mapDiv: Element, opts?: MapOptions);
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      [key: string]: any;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }
  }
}

// Extend the Window interface
interface Window {
  google: typeof google;
} 