import FocusAwareStatusBar from '../../../common/components/FocusAwareStatusBar';
import SecondaryButton from '../../../common/components/ThemeButtons/SecondaryButton';
import tw from '../../../common/tailwind';
import { PermissionStatus } from 'expo-modules-core';
import { FormLabel } from '../../../modules/forms';
import useNotifications from '../../../modules/notifications/hooks/useNotifications';
import AnimatedSettingsHeader from '../../../modules/track/components/AnimatedSettingsHeader';
import { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { OneSignal } from 'react-native-onesignal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { bodyMediumBold } from '../../../theme/typography';

export default function SettingsNotificationsScreen() {
  const offset = useRef(new Animated.Value(0)).current;

  const {
    permissionStatus,
    notificationsSettings,
    requestNotificationsPermission,
    setNotificationsPreference,
  } = useNotifications();

  // Temporary mock state and handlers
  // const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'default'>('default');
  // const [notificationsSettings, setNotificationsSettings] = useState({ showNotifications: false });

  // const requestNotificationsPermission = () => {
  //   // Simulate permission request
  //   setPermissionStatus('granted');
  //   setNotificationsSettings({ showNotifications: true });
  // };

  // const setNotificationsPreference = (value: boolean) => {
  //   setNotificationsSettings({ showNotifications: value });
  // };
  // End of mock setup

  
  const isActive = notificationsSettings.showNotifications;

  const handleAllowNotificationsPressed = () => {
    requestNotificationsPermission();
  };

  const handleNotificationsPreferenceChanged = (value: boolean) => {
    setNotificationsPreference(value);

    OneSignal.Notifications.requestPermission(value);
  };

  return (
    <View style={tw`flex-1 bg-creme`}>
      <AnimatedSettingsHeader animatedValue={offset} title="Notifications" />
      <Image
        resizeMode="cover"
        style={tw.style(
          `absolute top-0 w-[${
            Dimensions.get('window').width
          }px] bg-eggplant h-[${
            (Dimensions.get('screen').width * 271) / 374
          }px]`,
        )}
        source={require('../../../../assets/ribbons/eggplant-tall.png')}
      />
      <ScrollView
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: offset } } }],
          { useNativeDriver: false },
        )}
        contentContainerStyle={tw.style('grow')}
      >
        <SafeAreaView style={tw`z-10 flex-1`}>
          <View style={tw.style('mt-15 flex-1 bg-creme px-5 pt-8')}>
            <View style={tw`mb-8`}>
              <FormLabel>Notifications</FormLabel>
              {permissionStatus === PermissionStatus.GRANTED ? (
                // Granted view
                <View style={tw.style(`flex-row`)}>
                  <Pressable
                    style={tw.style(
                      `flex-1 items-center rounded-l-md border border-strokecream py-2.5 ${
                        !isActive
                          ? 'border-eggplant-light bg-eggplant-vibrant'
                          : 'border-strokecream bg-white'
                      }`,
                    )}
                    onPress={() => {
                      handleNotificationsPreferenceChanged(false);
                    }}
                  >
                    <Text
                      style={tw.style(
                        bodyMediumBold,
                        'tracking-widest',
                        !isActive ? 'text-white' : 'text-stone',
                      )}
                    >
                      Off
                    </Text>
                  </Pressable>
                  <Pressable
                    style={tw.style(
                      `flex-1 items-center rounded-r-md border py-2.5 ${
                        isActive
                          ? 'border-eggplant-light bg-eggplant-vibrant'
                          : 'border-strokecream bg-white'
                      }`,
                    )}
                    onPress={() => {
                      handleNotificationsPreferenceChanged(true);
                    }}
                  >
                    <Text
                      style={tw.style(
                        bodyMediumBold,
                        'tracking-widest',
                        isActive ? 'text-white' : 'text-stone',
                      )}
                    >
                      On
                    </Text>
                  </Pressable>
                </View>
              ) : (
                // Denied view
                <View>
                  <SecondaryButton onPress={handleAllowNotificationsPressed}>
                    Allow notifications
                  </SecondaryButton>
                </View>
              )}
            </View>
          </View>
        </SafeAreaView>
      </ScrollView>

      <FocusAwareStatusBar statusBarStyle="light" />
    </View>
  );
}
