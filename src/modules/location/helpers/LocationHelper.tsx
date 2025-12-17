import * as Localization from 'expo-localization';

export interface LatLng {
  latitude: number;
  longitude: number;
}

function getDistance(coord1: LatLng, coord2: LatLng) {
  if (
    coord1.latitude === coord2.latitude &&
    coord1.longitude === coord2.longitude
  ) {
    return 0;
  }

  const radlat1 = (Math.PI * coord1.latitude) / 180;
  const radlat2 = (Math.PI * coord2.latitude) / 180;

  const theta = coord1.longitude - coord2.longitude;
  const radtheta = (Math.PI * theta) / 180;

  let dist =
    Math.sin(radlat1) * Math.sin(radlat2) +
    Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);

  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515; //miles by deafult

  const locale = Localization.getLocales()[0];
  if (locale.measurementSystem === 'metric') {
    dist *= 1.609344; // convert miles to km
  }

  return dist;
}

const LocationHelper = {
  getDistance,
};

export default LocationHelper;
