import Constants from 'expo-constants';
import { PushToken } from '../../modules/pushNotifications/types';
import { Platform } from 'react-native';

export function pushTokenFromToken(token: string) {
  const app_bundle = Platform.select({
    ios: Constants.expoConfig?.ios?.bundleIdentifier,
    android: Constants.expoConfig?.android?.package,
    default: 'com.greenr.app',
  });
  const app_build = Platform.select({
    ios: Constants.expoConfig?.ios?.buildNumber,
    android: Constants.expoConfig?.android?.versionCode?.toString(),
  });
  const pushToken: PushToken = {
    token,
    token_mode: __DEV__ ? 'dev' : 'prod',
    token_type: Platform.OS === 'ios' ? 'apns' : 'fcm',
    app_bundle,
    app_version: Constants.expoConfig?.version,
    app_build,
  };

  return pushToken;
}

export default pushTokenFromToken;
