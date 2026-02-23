import { useLinkTo } from '@react-navigation/native';
import FocusAwareStatusBar from '../../../common/components/FocusAwareStatusBar';
import tw from '../../../common/tailwind';
import { useGetCurrentUserQuery } from '../../../modules/auth/api';
import OnboardingCarousel from '../../../modules/intro/components/OnboardingCarousel';
import RotatingLoading from '../../../modules/intro/components/RotatingLoading';
import ONBOARDING from '../../../modules/intro/data/onboarding';
import React, { useEffect } from 'react';
import { Dimensions, ImageBackground, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingScreen() {
  const linkTo = useLinkTo();

  const { data: user, isLoading } = useGetCurrentUserQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  // Redirect to feed if the user has already completed onboarding.
  // country is set by PUT /auth/dietary-profile at the end of the carousel,
  // so its presence is the reliable onboarding-completion signal.
  useEffect(() => {
    if (user?.country) {
      linkTo('/feed');
    }
  }, [user?.country, linkTo]);

  if (isLoading) {
    return (
      <View style={tw`flex-1`}>
        <View
          style={[tw.style('flex-1 items-center justify-center bg-radish')]}
        >
          <RotatingLoading />
        </View>
        <FocusAwareStatusBar statusBarStyle="dark" />
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-creme`}>
      <ImageBackground
        style={tw`flex-1 bg-creme`}
        source={require('../../../../assets/ribbons/onboarding.png')}
        imageStyle={{
          resizeMode: 'cover',
          height: (Dimensions.get('screen').width * 297) / 375,
          top: undefined,
        }}
      >
        <SafeAreaView edges={['bottom']} style={tw`flex-1`}>
          <OnboardingCarousel data={ONBOARDING(user?.first_name) as any} />
        </SafeAreaView>
      </ImageBackground>
      <FocusAwareStatusBar statusBarStyle="dark" />
    </View>
  );
}
