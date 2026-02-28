import EventEmitter from 'events';
import * as Device from 'expo-device';
import { PermissionStatus } from 'expo-modules-core';
import * as Notifications from 'expo-notifications';
import { AndroidNotificationPriority } from 'expo-notifications';
import Constants from 'expo-constants';
import { CurrentUser } from '../../models/Session';
import {
  TokenManagerEvents,
  TokenManagerPermissionStatus,
} from '../../modules/pushNotifications/TokenManagerBase';
import {
  AppState,
  AppStateStatus,
  NativeEventSubscription,
  Platform,
} from 'react-native';

/**
 * Returns true when the app is running inside Expo Go.
 * In Expo Go, getDevicePushTokenAsync() returns a token bound to
 * host.exp.exponent — it cannot be used with your own Firebase project.
 * We use getExpoPushTokenAsync() instead and route through Expo's push service.
 */
function isRunningInExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

const EAS_PROJECT_ID = '834347b1-3a49-45f6-8aca-16929fc1895a';

async function getPushToken(): Promise<string> {
  if (isRunningInExpoGo()) {
    const result = await Notifications.getExpoPushTokenAsync({ projectId: EAS_PROJECT_ID });
    console.log('[PushToken] Got Expo push token (Expo Go):', result.data.substring(0, 30) + '...');
    return result.data;
  }
  const result = await Notifications.getDevicePushTokenAsync();
  console.log('[PushToken] Got device push token:', result.data.substring(0, 20) + '...');
  return result.data;
}

function expoPermissionStatusToTokenManagerPermissionStatus(
  status: PermissionStatus,
): TokenManagerPermissionStatus {
  switch (status) {
    case PermissionStatus.DENIED:
      return TokenManagerPermissionStatus.DENIED;
    case PermissionStatus.GRANTED:
      return TokenManagerPermissionStatus.GRANTED;
    case PermissionStatus.UNDETERMINED:
      return TokenManagerPermissionStatus.UNDETERMINED;
  }
}

class TokenManager extends EventEmitter {
  static shared = new TokenManager();

  private token?: string = undefined;

  private permission: TokenManagerPermissionStatus =
    TokenManagerPermissionStatus.UNDETERMINED;

  private appStateListener?: NativeEventSubscription;

  initialize = async () => {
    // Nothing works on android 13 until you create a notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
          priority: AndroidNotificationPriority.DEFAULT,
        }),
      });
    }

    // Watch for the app state changing so we can re-check permissions
    this.appStateListener?.remove();
    this.appStateListener = AppState.addEventListener(
      'change',
      this.appStateChanged,
    );

    const { status } = await Notifications.getPermissionsAsync();
    this.setPermission(
      expoPermissionStatusToTokenManagerPermissionStatus(status),
    );

    if (this.permission === TokenManagerPermissionStatus.GRANTED) {
      try {
        const token = await getPushToken();
        this.setToken(token);
      } catch (e) {
        console.warn('[PushToken] Failed to get device push token:', e);
      }
    }
  };

  appStateChanged = (appStateStatus: AppStateStatus) => {
    if (appStateStatus === 'active') {
      this.checkNotificationPermissions();
    }
  };

  checkNotificationPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    this.setPermission(
      expoPermissionStatusToTokenManagerPermissionStatus(status),
    );

    if (this.permission === 'granted') {
      try {
        this.setToken(await getPushToken());
      } catch (e) {
        console.warn('[PushToken] Failed to refresh device push token:', e);
      }
    } else {
      this.setToken(undefined);
    }
  };

  registerForPushNotifications = async () => {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.error('Failed to get push token for push notification!');
      return;
    }
    this.setPermission(TokenManagerPermissionStatus.GRANTED);
    try {
      this.setToken(await getPushToken());
    } catch (e) {
      console.warn('[PushToken] Failed to get device push token after permission grant:', e);
    }
  };

  canAskForPermission = () => {
    if (this.permission === 'granted') {
      return false;
    }

    if (Platform.OS === 'android' && Device.osVersion === '13') {
      // If we are on android 13, we can ask while the permission is denied
      return true;
    } else {
      // Otherwise can only ask if we have not denied
      return this.permission !== 'denied';
    }
  };

  setToken = (token?: string) => {
    this.token = token;
    this.emit(TokenManagerEvents.TokenChanged, this.token);
  };

  getToken = () => this.token;

  setPermission = (permission: TokenManagerPermissionStatus) => {
    this.permission = permission;
    this.emit(TokenManagerEvents.PermissionChanged, this.permission);
  };

  getPermission = () => this.permission;

  // Login is a no-op for the expo token manager
  // eslint-disable-next-line class-methods-use-this
  identifyUser = (_user: CurrentUser) => {};
}

export default TokenManager;
