export interface CurrentUserLocation {
  id: number;
  lat: number;
  lng: number;
  source: 'device' | 'geoip' | 'transaction';
}

export interface CurrentUserLocationRequest {
  source: 'device' | 'geoip' | 'transaction';
  ip?: string;
  lat?: number;
  lng?: number;
}
