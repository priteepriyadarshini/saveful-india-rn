import Constants from 'expo-constants';
import * as IntentLauncher from 'expo-intent-launcher';
import { Linking, Platform } from 'react-native';

const pkg = Constants?.expoConfig?.android?.package;

export function openAppSettings() {
  if (Platform.OS === 'ios') {
    Linking.openSettings();
  } else {
    IntentLauncher.startActivityAsync(
      IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS,
      { data: `package:${pkg}` },
    );
  }
}

export function openNotificationSettings() {
  if (Platform.OS === 'ios') {
    Linking.openSettings();
  } else {
    IntentLauncher.startActivityAsync(
      IntentLauncher.ActivityAction.APP_NOTIFICATION_SETTINGS,
      { data: `package:${pkg}` }, // This is not opening for any reason
    );
  }
}

export function openLocationSettings() {
  if (Platform.OS === 'ios') {
    Linking.openSettings();
  } else {
    IntentLauncher.startActivityAsync(
      IntentLauncher.ActivityAction.LOCATION_SOURCE_SETTINGS,
      // { data: `package:${pkg}` }, // Trying to see why is not going to the app location side
    );
  }
}
