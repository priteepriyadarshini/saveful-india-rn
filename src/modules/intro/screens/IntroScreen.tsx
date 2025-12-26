// import { useLinkTo } from '@react-navigation/native';
import FocusAwareStatusBar from '../../../common/components/FocusAwareStatusBar';
import PrimaryButton from '../../../common/components/ThemeButtons/PrimaryButton';
import VersionNumber from '../../../common/components/VersionNumber';
import tw from '../../../common/tailwind';
import IntroCarousel from '../../../modules/intro/components/IntroCarousel';
import INTRO from '../../../modules/intro/data/intro';
import React, { useEffect } from 'react';
import { Image, ImageBackground, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import useAccessToken from '../../auth/hooks/useSessionToken';
import { useGetUserOnboardingQuery } from '../api/api';

export default function IntroScreen() {
  const navigation = useNavigation();
  const accessToken = useAccessToken();
  const { data: userOnboarding } = useGetUserOnboardingQuery(undefined, {
    skip: !accessToken, // Only fetch if user is authenticated
  });

  // Auto-navigate existing users
  useEffect(() => {
    if (accessToken) {
      if (userOnboarding) {
        // User is logged in and has completed onboarding - go to feed
        // @ts-ignore
        navigation.navigate('Root');
      } else {
        // User is logged in but hasn't completed onboarding
        // @ts-ignore
        navigation.navigate('Onboarding');
      }
    }
  }, [accessToken, userOnboarding, navigation]);

  const handleGetStarted = () => {
    // @ts-ignore
    navigation.navigate('Auth');
  };

  // Only show intro UI for new users (no access token)
  if (accessToken) {
    return null; // Will navigate automatically via useEffect
  }

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
            onPress={handleGetStarted}
            buttonSize="large"
            width="full"
          >
            Get Started
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
