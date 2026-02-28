// import React from 'react';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import AppNavigation from './modules/navigation/AppNavigation';

// export default function App() {
//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <AppNavigation />
//     </GestureHandlerRootView>
//   );
// }

import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { PortalProvider } from '@gorhom/portal';
import { useDeviceContext } from 'twrnc';
import tw from './common/tailwind';

import Constants from 'expo-constants';
import AppNavigation from './modules/navigation/AppNavigation';
import { EnvironmentProvider } from './modules/environment/context/EnvironmentContext';
import { CurrentRouteProvider } from './modules/route/context/CurrentRouteContext';
import { store } from './store/store';
import { Provider } from 'react-redux';
import useCachedResources from './common/hooks/useCachedResources';
import OtherLaunchTasksHandler from './common/providers/OtherLaunchTasksHandler';
import { MixPanelContextProvider } from './modules/mixpanel/context/MixpanelContext';
import { NotificationsProvider } from './modules/notifications/context/NotificationsContext';
import { BadgeNotificationProvider } from './modules/badges/context/BadgeNotificationContext';
import ErrorBoundary from './common/components/ErrorBoundary';
import { View, Text } from 'react-native';

export default function App() {
  useDeviceContext(tw);
  
  const isLoadingComplete = useCachedResources();

  if (!isLoadingComplete) {
    return null; 
  }

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <CurrentRouteProvider>
          <EnvironmentProvider>
            <MixPanelContextProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <BottomSheetModalProvider>
                  <ActionSheetProvider>
                    <PortalProvider>
                      <NotificationsProvider>
                        <BadgeNotificationProvider>
                          <SafeAreaProvider initialMetrics={initialWindowMetrics}>
                            <OtherLaunchTasksHandler />
                            <AppNavigation />
                            {/* <View><Text> Hello</Text></View> */}
                          </SafeAreaProvider>
                        </BadgeNotificationProvider>
                      </NotificationsProvider>
                    </PortalProvider>
                  </ActionSheetProvider>
                </BottomSheetModalProvider>
              </GestureHandlerRootView>
            </MixPanelContextProvider>
          </EnvironmentProvider>
        </CurrentRouteProvider>
      </Provider>
    </ErrorBoundary>
  );
}
