import EventEmitter from 'events';
import * as Device from 'expo-device';
import { PermissionStatus } from 'expo-modules-core';
import * as Notifications from 'expo-notifications';
import { AndroidNotificationPriority } from 'expo-notifications';
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
          shouldShowAlert: true,
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
        // const token = await Notifications.getDevicePushTokenAsync();
        // console.log({ token });
        // this.setToken(token.data);
      } catch (e) {
        console.log({ e });
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
      // this.setToken((await Notifications.getDevicePushTokenAsync()).data);
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
    // this.setToken((await Notifications.getDevicePushTokenAsync()).data);
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
