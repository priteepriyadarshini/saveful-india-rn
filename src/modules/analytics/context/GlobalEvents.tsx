import useLocationPermissions from '../../../common/hooks/useLocationPermissions';
import usePrevious from '../../../common/hooks/usePrevious';
import * as Location from 'expo-location';
import {
  mixpanelEventName,
  routeNameToScreenTrackingName,
} from '../../../modules/analytics/analytics';
import useAnalytics from '../../../modules/analytics/hooks/useAnalytics';
import { TokenManagerPermissionStatus } from '../../../modules/pushNotifications/TokenManagerBase';
import usePushNotificationPermission from '../../../modules/pushNotifications/usePushNotificationPermission';
import React from 'react';

export default function GlobalEvents({ routeName }: { routeName?: string }) {
  const { sendAnalyticsEvent } = useAnalytics();

  const { permission: locationPermission } = useLocationPermissions();
  const { permission: notificationPermission } =
    usePushNotificationPermission();

  const previousNotificationPermission = usePrevious(notificationPermission);
  const previousLocationPermission = usePrevious(locationPermission);

  // If location permission updates, send an event
  React.useEffect(() => {
    if (
      locationPermission !== previousLocationPermission &&
      locationPermission !== Location.PermissionStatus.UNDETERMINED &&
      previousLocationPermission
    ) {
      sendAnalyticsEvent({
        event: mixpanelEventName.locationPermissionChanged,
        properties: {
          location: routeNameToScreenTrackingName(routeName ?? 'Unknown'),
          action: 'Location Permission State Changed',
          opt_in_location:
            locationPermission === Location.PermissionStatus.GRANTED,
          status: locationPermission,
        },
      });
    }
  }, [
    locationPermission,
    previousLocationPermission,
    routeName,
    sendAnalyticsEvent,
  ]);

  // If notification permission updates, send an event
  React.useEffect(() => {
    if (
      notificationPermission !== previousNotificationPermission &&
      notificationPermission !== TokenManagerPermissionStatus.UNDETERMINED &&
      previousNotificationPermission
    ) {
      sendAnalyticsEvent({
        event: mixpanelEventName.notificationPermissionChanged,
        properties: {
          location: routeNameToScreenTrackingName(routeName ?? 'Unknown'),
          action: 'Notification Permission State Changed',
          opt_in_notifications:
            notificationPermission === TokenManagerPermissionStatus.GRANTED,
          status: notificationPermission,
        },
      });
    }
  }, [
    notificationPermission,
    previousLocationPermission,
    previousNotificationPermission,
    routeName,
    sendAnalyticsEvent,
  ]);

  return null;
}
