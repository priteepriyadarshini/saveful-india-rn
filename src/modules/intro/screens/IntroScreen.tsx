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
import React from 'react';
import { Image, ImageBackground, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HAS_SEEN_INTRO_KEY } from '../components/SplashPage';

export default function IntroScreen() {
  const navigation = useNavigation();

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem(HAS_SEEN_INTRO_KEY, 'true');
      (navigation as any).reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } catch (error) {
      console.error('Error saving intro seen status:', error);
      (navigation as any).reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    }
  };

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
