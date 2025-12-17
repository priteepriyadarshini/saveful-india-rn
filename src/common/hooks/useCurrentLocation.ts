import * as Location from 'expo-location';
import { LocationObject, LocationSubscription } from 'expo-location';
import LocationHelper from '../../modules/location/helpers/LocationHelper';
import React from 'react';

import useIsActiveAndFocused from './useIsActiveAndFocused';
import useLocationPermissions from './useLocationPermissions';

export default function useWatchLocation(
  accuracy: Location.Accuracy = Location.Accuracy.Balanced,
  minChangeDistanceInMeters = 0,
) {
  const [location, setLocation] = React.useState<LocationObject | undefined>(
    undefined,
  );
  const { permission } = useLocationPermissions();

  const foregroundSubscription = React.useRef<LocationSubscription | undefined>(
    undefined,
  );

  const visible = useIsActiveAndFocused();

  const shouldWatch =
    visible && permission === Location.PermissionStatus.GRANTED;

  React.useEffect(() => {
    const manageSubscription = async () => {
      // console.debug({visible, shouldWatch, subscription: foregroundSubscription.current})

      if (shouldWatch && !foregroundSubscription.current) {
        console.debug('useCurrentLocation: starting foreground subscription');
        // Start watching position in real-time
        foregroundSubscription.current = await Location.watchPositionAsync(
          {
            // For better logs, we set the accuracy to the most sensitive option
            accuracy,
          },
          currentLocation => {
            if (location && minChangeDistanceInMeters > 0) {
              const lastLocationDistance = LocationHelper.getDistance(
                location.coords,
                currentLocation.coords,
              );

              if (lastLocationDistance < minChangeDistanceInMeters) {
                return;
              }
            }

            setLocation(currentLocation);
          },
        );
      } else if (!shouldWatch && foregroundSubscription.current) {
        console.debug('useCurrentLocation: stopping foreground subscription');
        foregroundSubscription.current?.remove();
        foregroundSubscription.current = undefined;
      } else {
        console.debug('useCurrentLocation: no change');
      }
    };

    manageSubscription();

    return () => {
      if (foregroundSubscription.current) {
        console.debug('Cleaning up subscription');
        foregroundSubscription.current?.remove();
        foregroundSubscription.current = undefined;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldWatch, accuracy, minChangeDistanceInMeters]);

  return location;
}
