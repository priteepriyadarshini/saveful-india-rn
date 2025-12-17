// Wrapper for expo-haptics that excludes android because android phones are often bad
// and have bad haptics
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const SavefulHaptics = {
  selectionAsync: async () => {
    if (Platform.OS === 'android') return;

    return Haptics.selectionAsync();
  },

  impactAsync: async (style?: Haptics.ImpactFeedbackStyle) => {
    if (Platform.OS === 'android') return;

    return Haptics.impactAsync(style);
  },

  notificationAsync: async (type?: Haptics.NotificationFeedbackType) => {
    if (Platform.OS === 'android') return;

    return Haptics.notificationAsync(type);
  },
  NotificationFeedbackType: Haptics.NotificationFeedbackType,
  ImpactFeedbackStyle: Haptics.ImpactFeedbackStyle,
};

export default SavefulHaptics;
