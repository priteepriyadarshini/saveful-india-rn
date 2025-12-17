import { useLinkTo } from '@react-navigation/native';
import { PermissionStatus } from 'expo-modules-core';
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
  // Only for push notifications
  // token = (await Notifications.getExpoPushTokenAsync()).data;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true, 
      priority: AndroidNotificationPriority.DEFAULT,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      showBadge: true,
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FFFFFF',
    }).finally(() => {});
  }

  return finalStatus;
}

const useNotifications = () => {
  const [state, setAndPersistState] = useContext(NotificationsContext);
  const notificationListener = useRef<Subscription | null>(null);
  const responseListener = useRef<Subscription | null>(null);
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
    if (state.showNotifications) {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Saveful',
          body: message,
          data: { url },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: delayInSeconds,
          repeats: false,
        }as Notifications.TimeIntervalTriggerInput,
      });

      return notificationId;
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

  useEffect(() => {
    if (!state.isListenersSet) {
      notificationListener.current =
        Notifications.addNotificationReceivedListener(notification => {
          console.log('notification: ', notification.request.identifier);
        });
      responseListener.current =
        Notifications.addNotificationResponseReceivedListener(response => {
          const url = response.notification.request.content.data.url as string | undefined;
          if (url) {
            linkTo(url);
          }
        });
      setAndPersistState({ ...state, isListenersSet: true });
    }

    // return () => {
    //   if (notificationListener.current) {
    //     Notifications.removeNotificationSubscription(
    //       notificationListener.current,
    //     );
    //   }
    //   if (responseListener.current) {
    //     Notifications.removeNotificationSubscription(responseListener.current);
    //   }
    // };
  }, [state, linkTo, setAndPersistState]);

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
