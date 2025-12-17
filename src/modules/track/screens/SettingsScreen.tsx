import { Feather } from '@expo/vector-icons';
import { useLinkTo, useNavigation } from '@react-navigation/native';
import FocusAwareStatusBar from '../../../common/components/FocusAwareStatusBar';
import SecondaryButton from '../../../common/components/ThemeButtons/SecondaryButton';
import VersionNumber from '../../../common/components/VersionNumber';
import tw from '../../../common/tailwind';
import * as WebBrowser from 'expo-web-browser';
import { mixpanelEventName } from '../../../modules/analytics/analytics';
import useAnalytics from '../../../modules/analytics/hooks/useAnalytics';
import {
  useDeleteCurrentUserMutation,
  useDeleteSessionMutation,
} from '../../../modules/auth/api';
import { useRefreshToken } from '../../../modules/auth/hooks/useSessionToken';
import { clearSessionData } from '../../../modules/auth/sessionSlice';
import { MixPanelContext } from '../../../modules/mixpanel/context/MixpanelContext';
import usePushNotificationToken from '../../../modules/pushNotifications/usePushNotificationToken';
import AnimatedSettingsHeader from '../../../modules/track/components/AnimatedSettingsHeader';
import { useContext, useRef } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch } from '../../../store/hooks';
import { cardDrop } from '../../../theme/shadow';
import {
  bodyLargeMedium,
  bodySmallRegular,
  labelLarge,
} from '../../../theme/typography';
import { TrackStackScreenProps } from '../navigation/TrackNavigation';

export default function SettingsScreen() {
  const offset = useRef(new Animated.Value(0)).current;

  //const linkTo = useLinkTo();
  const navigation = useNavigation<TrackStackScreenProps<'Settings'>['navigation']>();

  const data = [
    { id: 1, name: 'Your details', route: 'SettingsDetails' },
    { id: 2, name: 'Saveful settings', route: 'SettingsSaveful' },
    { id: 3, name: 'Notifications', route: 'SettingsNotifications' },
    { id: 4, name: 'Linked accounts', route: 'SettingsAccounts' },
    {
      id: 5,
      name: 'Privacy policy',
      url: 'https://www.saveful.com/privacy-policy',
    },
    {
      id: 6,
      name: 'Terms of service',
      url: 'https://www.saveful.com/terms-of-service',
    },
  ];

  // Delete account
  const [deleteCurrentUser, { isLoading: isDeleteUserLoading }] =
    useDeleteCurrentUserMutation();

  // Log out
  const dispatch = useAppDispatch();
  const [deleteSession, { isLoading: isSigningout }] =
    useDeleteSessionMutation();

  const [mixpanel] = useContext(MixPanelContext);

  const doDeleteAccount = async () => {
    try {
      await deleteCurrentUser();

      sendAnalyticsEvent({
        event: mixpanelEventName.userDeleted,
      });
      mixpanel?.getPeople().set({
        account_status: 'deleted',
      });

      await dispatch(clearSessionData());
    } catch {}
  };

  const onDeleteAccountPress = () => {
    Alert.alert(
      'Delete account',
      'Are you sure you want to delete your account?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => null,
        },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => doDeleteAccount(),
        },
      ],
    );
  };

  const { token: notification_token } = usePushNotificationToken();
  const refreshToken = useRefreshToken();

  const { sendResetEvent, sendAnalyticsEvent } = useAnalytics();

  const doLogout = async (everywhere: boolean) => {
    try {
      await deleteSession({
        refresh_token: everywhere ? undefined : refreshToken,
        notification_token,
      });
      sendAnalyticsEvent({
        event: mixpanelEventName.userSignedout,
        properties: {
          logout_everywhere: everywhere,
        },
      });

      sendResetEvent();
      await dispatch(clearSessionData());
    } catch {}
  };

  const onLogOutPress = () => {
    Alert.alert(
      'Log out',
      'Do you want to log out of just this device, or everywhere?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            sendAnalyticsEvent({
              event: mixpanelEventName.userCancelSignOut,
            });
          },
        },
        {
          text: 'This device',
          style: 'default',
          onPress: () => doLogout(false),
        },
        {
          text: 'Everywhere',
          style: 'destructive',
          onPress: () => doLogout(true),
        },
      ],
    );
  };

  return (
    <View style={tw`flex-1 bg-creme`}>
      <Image
        source={require('../../../../assets/ribbons/eggplant-tall.png')}
        resizeMode="cover"
        style={tw.style(
          `absolute top-0 w-[${
            Dimensions.get('window').width
          }px] bg-eggplant h-[${
            (Dimensions.get('screen').width * 271) / 374
          }px]`,
        )}
      />
      <AnimatedSettingsHeader animatedValue={offset} title="Settings" />

      <ScrollView
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: offset } } }],
          { useNativeDriver: false },
        )}
      >
        <SafeAreaView style={tw`z-10 flex-1`}>
          <View
            style={tw.style(
              `z-10 mx-5 -mb-12 mt-20 gap-3 rounded border border-eggplant bg-white px-6 pb-5 pt-4`,
              cardDrop,
            )}
          >
            <View style={tw.style('border-b border-eggplant')}>
              <Text
                style={tw.style(
                  labelLarge,
                  'pb-2.5 text-center uppercase text-eggplant',
                )}
              >
                Need a hand?
              </Text>
            </View>
            <Text style={tw.style(bodySmallRegular, 'text-midgray')}>
              We're here to help! If you need a hand with anything in the app,
              or have any questions feel free to reach out and we'll help out.
            </Text>
            <SecondaryButton
              buttonSize="small"
              onPress={() => {
                WebBrowser.openBrowserAsync('https://www.saveful.com/contact');
              }}
              iconRight="arrow-right"
            >
              Contact support
            </SecondaryButton>
          </View>
        </SafeAreaView>
        <View style={tw.style('bg-creme px-5 pt-20')}>
          <View>
            {data.map((item, index) => (
              <Pressable
                onPress={() => {
                  if (item.route) {
                    navigation.navigate(item.route as any);
                  }

                  if (item.url) {
                    WebBrowser.openBrowserAsync(item.url);
                  }
                }}
                key={item.id}
                style={tw.style(
                  index === 0 ? 'border-t' : '',
                  `flex-row justify-between border-b border-strokecream py-4`,
                )}
              >
                <Text
                  style={tw.style(
                    item.url ? bodySmallRegular : bodyLargeMedium,
                    'text-midgray',
                  )}
                >
                  {item.name}
                </Text>
                <Feather
                  name={item.url ? 'external-link' : 'arrow-right'}
                  size={16}
                  color={tw.color('midgray')}
                />
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={tw.style('gap-2 bg-strokecream px-5 py-8')}>
        <SecondaryButton
          onPress={onDeleteAccountPress}
          buttonSize="large"
          loading={isDeleteUserLoading}
        >
          Delete my account
        </SecondaryButton>
        <SecondaryButton
          onPress={onLogOutPress}
          buttonSize="large"
          loading={isSigningout}
        >
          Log out
        </SecondaryButton>
      </View>
      <View style={tw`absolute bottom-2 left-5 right-5 items-center`}>
        <VersionNumber />
      </View>

      <FocusAwareStatusBar statusBarStyle="light" />
    </View>
  );
}
