import { JsonMap } from '@segment/analytics-react-native';
import removeNullProperties, { 
  User, 
  AnalyticsData, 
  mixpanelEventName 
} from '../analytics';
import EnvironmentManager from '../../environment/environmentManager';
import { MixPanelContext } from '../../mixpanel/context/MixpanelContext';
import { useCurentRoute } from '../../route/context/CurrentRouteContext';
import React, { useContext } from 'react';
import { Alert } from 'react-native';



function useAnalytics(){
  const [mixpanel] = useContext(MixPanelContext);
  const { newCurrentRoute } = useCurentRoute();

  const [scrollInitiated, setScrollInitiated] = React.useState(false);
  const [scrollPercentage, setScrollPercentage] = React.useState(0);

  const env = EnvironmentManager.shared.getEnvironment();

  // 🔧 Replace feature flags with simple booleans
  // Change these values once feature flag file has been created
  const alertOnTrackEvent = false;
  const alertOnIdentify = false;
  const alertOnScreen = false;

  const sendAliasUserID = React.useCallback((user_id: string | null) => {
    if (user_id) {
      // mixpanel?.alias(user_id); // Uncomment if aliasing is supported
    }
  }, []);

  const sendAnalyticsUserID = React.useCallback(
    (
      user_id: string | null,
      userProperties?: User | null,
      _extra: { [key: string]: unknown } = {},
    ) => {
      if (user_id && userProperties) {
        const checkUserProperties = removeNullProperties?.(userProperties);

        mixpanel?.identify(user_id);
        mixpanel?.getPeople().set({
          ...checkUserProperties,
        });

        if (alertOnIdentify) {
          Alert.alert('Tracking: identify', JSON.stringify(checkUserProperties));
        }
      }
    },
    [alertOnIdentify, mixpanel],
  );

  const sendAnalyticsEvent = React.useCallback(
    (data: AnalyticsData | undefined) => {
      if (data?.event) {
        mixpanel?.track(data.event, data.properties);
        if (alertOnTrackEvent) {
          Alert.alert(`Tracking: ${data.event}`, JSON.stringify(data.properties));
        }
      }
    },
    [alertOnTrackEvent, mixpanel],
  );

  const sendScreenEvent = React.useCallback(
    (screenName: string, properties?: JsonMap) => {
      mixpanel?.track(screenName, properties);
      if (alertOnScreen) {
        Alert.alert(`Tracking screen: ${screenName}`, JSON.stringify(properties));
      }
    },
    [alertOnScreen, mixpanel],
  );

  const sendResetEvent = React.useCallback(() => {
    mixpanel?.reset();

    if (alertOnTrackEvent) {
      Alert.alert('Tracking: reset');
    }
  }, [alertOnTrackEvent, mixpanel]);

  const sendFlushEvent = React.useCallback(() => {
    mixpanel?.flush();

    if (alertOnTrackEvent) {
      Alert.alert('Tracking: flush');
    }
  }, [alertOnTrackEvent, mixpanel]);

  const sendUpdateEventProfile = React.useCallback(
    (properties: any) => {
      const checkUserProperties = removeNullProperties?.(properties);
      
      mixpanel?.getPeople().set(checkUserProperties);
      
      if (alertOnTrackEvent) {
        Alert.alert('Tracking: update profile', JSON.stringify(checkUserProperties));
      }
    },
    [alertOnTrackEvent, mixpanel],
  );

  const sendScrollEventInitiation = React.useCallback(
    (event: any, eventName: string) => {
      const contentHeight = event.nativeEvent.contentSize.height;
      const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;
      const scrollOffset = event.nativeEvent.contentOffset.y;

      const currentScrollPercentage =
        (scrollOffset / (contentHeight - scrollViewHeight)) * 100;

      if (
        !scrollInitiated &&
        currentScrollPercentage > 25 &&
        scrollPercentage <= 25
      ) {
        sendAnalyticsEvent({
          event: mixpanelEventName.scrollInitiated,
          properties: {
            location: newCurrentRoute,
            action: eventName,
          },
        });

        setScrollInitiated(true);
      }

      setScrollPercentage(currentScrollPercentage);
    },
    [newCurrentRoute, scrollInitiated, scrollPercentage, sendAnalyticsEvent],
  );

  const sendOnboardingEventAnalytics = React.useCallback(
    (currentIndex: number) => {
      switch (currentIndex) {
        case 0:
          return sendAnalyticsEvent({
            event: mixpanelEventName.actionClicked,
            properties: {
              action: mixpanelEventName.onboardingStarted,
            },
          });
        default:
          return '';
      }
    },
    [sendAnalyticsEvent],
  );

  const sendFailedEventAnalytics = React.useCallback(
    (errorMessage: unknown) => {
      return sendAnalyticsEvent({
        event: mixpanelEventName.error,
        properties: {
          action: errorMessage,
        },
      });
    },
    [sendAnalyticsEvent],
  );

  const sendTimeEventAnalytics = React.useCallback(
    (event: string) => {
      return mixpanel?.timeEvent(event);
    },
    [mixpanel],
  );

  return {
    sendAnalyticsUserID,
    sendAliasUserID,
    sendAnalyticsEvent,
    sendResetEvent,
    sendScreenEvent,
    sendFlushEvent,
    sendUpdateEventProfile,
    sendScrollEventInitiation,
    sendOnboardingEventAnalytics,
    sendFailedEventAnalytics,
    sendTimeEventAnalytics,
    env,
  };
}

export default useAnalytics;