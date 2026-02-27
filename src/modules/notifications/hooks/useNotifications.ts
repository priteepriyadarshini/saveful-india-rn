import { useLinkTo } from '@react-navigation/native';
import { PermissionStatus } from 'expo-modules-core';
import * as ExpoLinking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import { AndroidNotificationPriority } from 'expo-notifications';
import { NotificationsContext } from '../../../modules/notifications/context/NotificationsContext';
import { useContext, useEffect, useRef, useState } from 'react';
import { Linking, Platform } from 'react-native';

declare type Subscription = {
  remove: () => void;
};

export interface NotificationFeedback {
  message: string;
  delayInSeconds: number;
  url: string;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: AndroidNotificationPriority.DEFAULT,
  }),
});

if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    showBadge: true,
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FFFFFF',
  }).catch((err) => {
    console.warn('[Notifications] Failed to create default notification channel:', err);
  });
}

async function registerForNotificationsAsync() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== PermissionStatus.GRANTED) {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== PermissionStatus.GRANTED) {
    return;
  }

  return finalStatus;
}

const useNotifications = () => {
  const [state, setAndPersistState] = useContext(NotificationsContext);
  const notificationListener = useRef<Subscription | null>(null);
  const responseListener = useRef<Subscription | null>(null);
  const listenersRegistered = useRef(false);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>(
    PermissionStatus.UNDETERMINED,
  );

  const linkTo = useLinkTo();

  const registerForNotifications = () => {
    registerForNotificationsAsync()
      .then(finalStatus => {
        if (finalStatus) {
          setPermissionStatus(finalStatus);
        }
      })
      .finally(() => {});
  };

  const scheduleNotification = async ({
    message,
    delayInSeconds,
    url,
  }: NotificationFeedback) => {
    if (!state.showNotifications) {
      console.log('[Notifications] Notifications disabled by user preference');
      return;
    }

    try {
      // Ensure we have permission before scheduling
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== PermissionStatus.GRANTED) {
        console.warn('[Notifications] Cannot schedule – permission not granted:', status);
        return;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Saveful',
          body: message,
          data: { url },
          sound: true,
          ...(Platform.OS === 'android' ? { channelId: 'default' } : {}),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: delayInSeconds,
          repeats: false,
        } as Notifications.TimeIntervalTriggerInput,
      });

      console.log('[Notifications] Scheduled:', notificationId, '| delay:', delayInSeconds, 's | url:', url);
      return notificationId;
    } catch (error) {
      console.error('[Notifications] Failed to schedule notification:', error);
    }
  };

  const requestNotificationsPermission = () => {
    Notifications.requestPermissionsAsync()
      .then(({ status }) => {
        setPermissionStatus(status);
        if (
          status === PermissionStatus.DENIED ||
          status === PermissionStatus.UNDETERMINED
        ) {
          if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:').finally(() => {});
          }
          if (Platform.OS === 'android') {
            Linking.openSettings().finally(() => {});
          }
        }
      })
      .finally(() => {});
  };

  const clearNotifications = async () => {
    await Notifications.getAllScheduledNotificationsAsync().then(res => {
      res.map(item => {
        Notifications.cancelScheduledNotificationAsync(item.identifier).finally(
          () => {},
        );

        return item.identifier;
      });
    });
  };

  const setNotificationsPreference = (value: boolean) => {
    setAndPersistState({ ...state, showNotifications: value });

    if (!value) {
      clearNotifications().finally(() => {});
    }
  };

  useEffect(() => {
    Notifications.getPermissionsAsync()
      .then(({ status }) => {
        setPermissionStatus(status);
      })
      .finally(() => {});
  }, []);

  const handleNotificationUrl = useRef((url: string) => {
    console.log('[Notifications] Navigating to:', url);
    try {
      linkTo(url);
    } catch (navError) {
      console.warn('[Notifications] linkTo failed, trying Linking fallback:', navError);
      try {
        const deepLink = ExpoLinking.createURL(url.startsWith('/') ? url.slice(1) : url);
        Linking.openURL(deepLink);
      } catch (fallbackError) {
        console.error('[Notifications] Fallback navigation also failed:', fallbackError);
      }
    }
  });
  // Keep the ref in sync with the latest linkTo
  useEffect(() => {
    handleNotificationUrl.current = (url: string) => {
      console.log('[Notifications] Navigating to:', url);
      try {
        linkTo(url);
      } catch (navError) {
        console.warn('[Notifications] linkTo failed, trying Linking fallback:', navError);
        try {
          const deepLink = ExpoLinking.createURL(url.startsWith('/') ? url.slice(1) : url);
          Linking.openURL(deepLink);
        } catch (fallbackError) {
          console.error('[Notifications] Fallback navigation also failed:', fallbackError);
        }
      }
    };
  }, [linkTo]);


  const coldStartHandled = useRef(false);
  useEffect(() => {
    if (coldStartHandled.current) return;
    coldStartHandled.current = true;

    Notifications.getLastNotificationResponseAsync().then(response => {
      if (!response) return;

      const url = response.notification.request.content.data?.url as string | undefined;
      console.log('[Notifications] Cold-start notification response, url:', url);
      if (url) {
        // Small delay to let navigation container finish initialising
        setTimeout(() => {
          handleNotificationUrl.current(url);
        }, 500);
      }
    }).catch(err => {
      console.warn('[Notifications] getLastNotificationResponseAsync failed:', err);
    });
  }, []);


  useEffect(() => {
    if (listenersRegistered.current) {
      return;
    }
    listenersRegistered.current = true;

    notificationListener.current =
      Notifications.addNotificationReceivedListener(notification => {
        console.log('[Notifications] Received:', notification.request.identifier);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(response => {
        const url = response.notification.request.content.data?.url as string | undefined;
        console.log('[Notifications] Tapped notification (live), url:', url);
        if (url) {
          handleNotificationUrl.current(url);
        }
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
      listenersRegistered.current = false;
    };
  }, []);

  return {
    notificationsSettings: state,
    permissionStatus,
    registerForNotifications,
    requestNotificationsPermission,
    scheduleNotification,
    setNotificationsPreference,
  };
};

export default useNotifications;
