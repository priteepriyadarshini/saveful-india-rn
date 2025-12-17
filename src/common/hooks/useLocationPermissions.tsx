import * as Location from 'expo-location';
import React from 'react';

import useAppState from './useAppState';

export default function useLocationPermissions() {
  const [permission, setPermission] = React.useState<Location.PermissionStatus>(
    Location.PermissionStatus.UNDETERMINED,
  );

  const state = useAppState();

  const checkLocationPermission = async () => {
    try {
      const permissionStatus = await Location.getForegroundPermissionsAsync();
      setPermission(permissionStatus.status);
      return permissionStatus;
    } catch (error) {
      console.log('Location Permissions: checkLocationPermission error', error);
      return null;
    }
  };

  const requestLocationPermission = async () => {
    try {
      const permissionStatus =
        await Location.requestForegroundPermissionsAsync();
      setPermission(permissionStatus.status);
      return permissionStatus;
    } catch (error) {
      console.error(
        'Location Permissions: requestLocationPermission error',
        error,
      );
      return null;
    }
  };

  // Check when the hook starts
  React.useEffect(() => {
    checkLocationPermission();
  }, []);

  // Re-check permissions when we become active
  React.useEffect(() => {
    if (state === 'active') {
      checkLocationPermission();
    }
  }, [state]);

  return { permission, checkLocationPermission, requestLocationPermission };
}
