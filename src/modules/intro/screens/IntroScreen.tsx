// import { useLinkTo } from '@react-navigation/native';
import FocusAwareStatusBar from '../../../common/components/FocusAwareStatusBar';
import PrimaryButton from '../../../common/components/ThemeButtons/PrimaryButton';
import VersionNumber from '../../../common/components/VersionNumber';
import tw from '../../../common/tailwind';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as WebBrowser from 'expo-web-browser';
import { Session } from '../../../models/Session';
import { segmentScreens } from '../../../modules/analytics/analytics';
import useAnalytics from '../../../modules/analytics/hooks/useAnalytics';
import { useLazyGetCurrentUserQuery } from '../../../modules/auth/api';
import { saveSessionData } from '../../../modules/auth/sessionSlice';
import EnvironmentManager from '../../../modules/environment/environmentManager';
import useFeatureFlag, { FeatureFlagKey } from '../../../modules/featureFlags';
import { loadFeatureFlags } from '../../../modules/featureFlags/slice';
import IntroCarousel from '../../../modules/intro/components/IntroCarousel';
import INTRO from '../../../modules/intro/data/intro';
import SchemeHelper from '../../../modules/intro/helpers/SchemeHelper';
import { useSendOneSignalPayloadMutation } from '../../../modules/oneSignalNotifications/api';
import { OneSignalPayload } from '../../../modules/oneSignalNotifications/types';
import { TokenManager } from '../../../modules/pushNotifications/TokenManager';
import React, { useEffect } from 'react';
import { Alert, Image, ImageBackground, Linking, View } from 'react-native';
import { OneSignal } from 'react-native-onesignal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch } from '../../../store/hooks';

export default function IntroScreen() {
  // const linkTo = useLinkTo();
  const dispatch = useAppDispatch();

  const {
    sendAnalyticsUserID,
    sendScreenEvent,
    sendAliasUserID,
    sendFailedEventAnalytics,
  } = useAnalytics();

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const fakeLogin = useFeatureFlag(FeatureFlagKey.FakeLogin, false);

  const [loadCurrentUser] = useLazyGetCurrentUserQuery();
  const [sendOneSignalPayload] = useSendOneSignalPayloadMutation();

  // Reload the feature flags on mount because on log out they may have been cleared
  React.useEffect(() => {
    dispatch(loadFeatureFlags());
  }, [dispatch]);

  const getOnboardingData = async (session?: Session) => {
    if (!session) {
      setIsLoading(false);
      return;
    }

    try {
      const user = await loadCurrentUser({
        accessToken: session.access_token,
      }).unwrap();

      if (user) {
        // Initiate indentify once login or sign up
        sendAliasUserID(user.id);
        sendAnalyticsUserID(user.id, {
          id: user.id,
          first_name: user.first_name,
          email: user.email,
          // invitation_code: user.invitation_code,
        });
        TokenManager.shared.identifyUser(user);
        OneSignal.login(user.id);
        OneSignal.User.addEmail(user.email);
        OneSignal.User.addTag('first_name', user.first_name);

        const oneSignalId = await OneSignal.User.getOnesignalId();

        // Send one signal detail to backend
        const serverPayload: OneSignalPayload = {
          notification_settings: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            oneSignalId,
          },
        };

        await sendOneSignalPayload(serverPayload);
      }

      await dispatch(saveSessionData(session));
    } catch (e) {
      sendFailedEventAnalytics(e);
      Alert.alert('Error fetching onboarding data', 'Please try again', [
        {
          text: 'Cancel',
        },
        {
          text: 'Retry',
          onPress: () => getOnboardingData(session),
        },
      ]);
    }

    setIsLoading(false);
  };

  const doFakeLogin = () => {
    // Grab token from the .env file!
    const session = {
      access_token: Constants.expoConfig?.extra?.dev?.accessToken ?? '',
      refresh_token: Constants.expoConfig?.extra?.dev?.refreshToken ?? '',
    };

    getOnboardingData(session);
  };

  const urlEventHandler = (url?: string) => {
    if (!url) {
      setIsLoading(false);
      return;
    }

    const parsedUrl = new URL(url);
    const args = new URLSearchParams(parsedUrl.search);

    // Login;
    const session = {
      access_token: args.get('access_token') ?? '',
      refresh_token: args.get('refresh_token') ?? '',
    };

    // If we don't want to consider them logged in until they've completed onboarding
    // then we could not set session data here
    // I feel like I wouldn't recommend this as its more stuff to make sure you get right
    // but if you save the session data here you don't have a lot of control over
    // how it transitions to the rest of the app...

    dispatch(saveSessionData(session));
    getOnboardingData(session);
  };

  const doSignIn = async () => {
    const redirectURL = SchemeHelper.getDeepLink('/login/redirect');
    const client = Constants.expoConfig?.name ?? 'Mobile app';
    const device = `${Device.brand} ${Device.modelName} (${Device.deviceName})`;
    const params = new URLSearchParams();
    params.set('redirect', redirectURL);
    params.set('client', client);
    params.set('device', device);
    const loginURL = `${EnvironmentManager.shared.webUrl()}/session?${params.toString()}`;

    sendScreenEvent(segmentScreens.login, {
      location: segmentScreens.login,
      action: 'Sign Up Screen Visited',
    });

    // Fix stupid thing breaking after enabling android app links by forcing it into a browser
    // let browserPackage: string | undefined;
    // if (Platform.OS === 'android') {
    //   const tabs = await WebBrowser.getCustomTabsSupportingBrowsersAsync();
    //   browserPackage = tabs.preferredBrowserPackage;
    // }

    const result = await WebBrowser.openAuthSessionAsync(
      loginURL,
      redirectURL,
      {
        // browserPackage,
        preferEphemeralSession: true,
        enableDefaultShareMenuItem: false,
        dismissButtonStyle: 'cancel',
        createTask: false,
      },
    );

    if (result.type !== 'success') {
      setIsLoading(false);
      return;
    }

    urlEventHandler(result.url);
  };

  useEffect(() => {
    const linkingListener = Linking.addEventListener('url', event =>
      urlEventHandler(event.url),
    );
    return () => linkingListener.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ImageBackground
      style={tw`relative flex-1 justify-between bg-creme`}
      source={require('../../../../assets/intro/splash.png')}
      imageStyle={{
        resizeMode: 'contain',
      }}
    >
      <SafeAreaView style={tw`flex-1 justify-between pb-2.5 pt-6`}>
        <View style={tw`shrink-0`}>
          <Image
            style={tw.style('mx-auto h-[58px] w-[111px]')}
            resizeMode="contain"
            source={require('../../../../assets/intro/logo.png')}
          />
        </View>
        <View style={tw`shrink justify-center`}>
          <IntroCarousel data={INTRO} />
        </View>

        <View style={tw`mb-2.5 w-full shrink-0 gap-1.5 px-5`}>
          <PrimaryButton
            onPress={fakeLogin ? doFakeLogin : doSignIn}
            disabled={isLoading}
            buttonSize="large"
            width="full"
          >
            Create an account or sign in
          </PrimaryButton>
        </View>
      </SafeAreaView>

      <FocusAwareStatusBar statusBarStyle="dark" />
      <View style={tw`absolute bottom-5 right-5`}>
        <VersionNumber />
      </View>
    </ImageBackground>
  );
}
