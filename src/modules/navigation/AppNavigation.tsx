import { PortalHost } from '@gorhom/portal';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Platform, View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  NavigationContainer,
  InitialState,
  useNavigationContainerRef,
} from '@react-navigation/native';
import {
  automaticallyTrackRouteName,
  mixpanelEventName,
  routeNameToScreenTrackingName,
} from '../../modules/analytics/analytics';
import InitialNavigator from './navigator/InitialNavigator';
import useAnalytics from '../analytics/hooks/useAnalytics';
import linking from '../deep_linking';
import { useCurentRoute } from '../route/context/CurrentRouteContext';
import GlobalEvents from '../analytics/context/GlobalEvents';


const PERSISTENCE_KEY = 'NAVIGATION_STATE';

function AppNavigation() {
  const navigationRef = useNavigationContainerRef();
  const routeNameRef = useRef<string>(undefined);

  const { sendScreenEvent } = useAnalytics();

  const [isReady, setIsReady] = React.useState<boolean>(!__DEV__);
  const [currentRoute, setCurrentRoute] = React.useState<string>('');

  const { updateCurrentRoute } = useCurentRoute();

  const [initialState, setInitialState] = React.useState<
    InitialState | undefined
  >(undefined);

  React.useEffect(() => {
    const restoreState = async () => {
      try {
        const initialUrl = await Linking.getInitialURL(); // Add this when expo is not beign used

        if (Platform.OS !== 'web' && initialUrl === null) {
          // Only restore state if there's no deep link and we're not on web
          const savedStateString = await AsyncStorage.getItem(PERSISTENCE_KEY);
          const state = savedStateString
            ? JSON.parse(savedStateString)
            : undefined;

          if (state !== undefined) {
            setInitialState(state);
          }
        }
      } finally {
        setIsReady(true);
      }
    };

    if (!isReady) {
      restoreState();
    }
  }, [isReady]);

  if (!isReady) {
    return <ActivityIndicator />;
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      //linking={linking}
      initialState={initialState}
      onReady={() => {
        routeNameRef.current = navigationRef?.getCurrentRoute()?.name;
      }}
      onStateChange={state => {
        const currentRouteName = navigationRef?.getCurrentRoute()?.name;

        if (
          currentRouteName !== currentRoute &&
          automaticallyTrackRouteName(currentRouteName)
        ) {
          sendScreenEvent(mixpanelEventName.screenLoaded, {
            action: `${routeNameToScreenTrackingName(
              currentRouteName,
            )} Visited`,
          });
        }
        setCurrentRoute(currentRouteName || '');
        updateCurrentRoute(currentRouteName || '');

        AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));
      }}
    >
      <GlobalEvents routeName={currentRoute} />
      <InitialNavigator />
      <PortalHost name="FormOverlay" />
    </NavigationContainer>
  );
}

export default AppNavigation;
