import {
  NativeStackScreenProps,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import OnboardingScreen from '../../../../modules/intro/screens/OnboardingScreen';
import React from 'react';

export type OnboardingStackParamList = {
  OnboardingHome: undefined;
  // PostOnboarding: undefined;
};

export type OnboardingStackScreenProps<
  Screen extends keyof OnboardingStackParamList,
> = NativeStackScreenProps<OnboardingStackParamList, Screen>;

const OnboardingNavigationStack =
  createNativeStackNavigator<OnboardingStackParamList>();

function OnboardingNavigator() {
  return (
    <OnboardingNavigationStack.Navigator
      screenOptions={{
        headerTransparent: true,
        headerTintColor: '#000000',
        headerBackTitle: '',
      }}
    >
      <OnboardingNavigationStack.Screen
        name="OnboardingHome"
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
      {/* <OnboardingNavigationStack.Screen
        name="PostOnboarding"
        component={PostOnboardingScreen}
        options={{ headerShown: false }}
      /> */}
    </OnboardingNavigationStack.Navigator>
  );
}

export default OnboardingNavigator;
