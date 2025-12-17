import * as Localization from 'expo-localization';
import LocationHelper, {
  LatLng,
} from '../../../modules/location/helpers/LocationHelper';
import React from 'react';

const MILE_VALUE = 0.621371;
const KM_IN_METERS = 1000;

export default function useDistanceLabel(
  coord1?: LatLng,
  coord2?: LatLng,
  maxDistanceAllowedInKm = 5,
) {
  const distanceLabel = React.useMemo(() => {
    if (!coord1 || !coord2) {
      return undefined;
    }

    const locale = Localization.getLocales()[0];
    const isMetric = locale.measurementSystem === 'metric';

    const maxDistance = isMetric
      ? maxDistanceAllowedInKm
      : maxDistanceAllowedInKm * MILE_VALUE;

    const minDistance = isMetric ? 1 : 1 * MILE_VALUE; // This will conver the 1km to miles if needed

    const distanceBetweenCords = LocationHelper.getDistance(coord1, coord2); // This will be given in km or miles depending on Localization

    let distance;
    let measureUnit;

    if (
      distanceBetweenCords <= maxDistance &&
      distanceBetweenCords >= minDistance
    ) {
      distance = distanceBetweenCords;
      if (isMetric) {
        measureUnit = 'km';
      } else {
        measureUnit = distance === 1 ? 'mile' : 'miles';
      }
    }

     if (distanceBetweenCords < minDistance) {
      distance = isMetric
        ? distanceBetweenCords * KM_IN_METERS // Make km to meters
        : distanceBetweenCords; // Make km to miles
      measureUnit = isMetric ? 'm' : 'ft';
    }

    return distance
      ? `${(+distance.toFixed(1)).toLocaleString()} ${measureUnit}`
      : undefined;
  }, [coord1, coord2, maxDistanceAllowedInKm]);

  return distanceLabel;
}
