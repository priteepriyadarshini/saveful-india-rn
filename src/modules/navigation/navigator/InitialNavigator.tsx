import { NavigatorScreenParams } from "@react-navigation/native";
import React, { useEffect } from "react";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { PermissionStatus } from 'expo-modules-core';
import useAccessToken from "../../auth/hooks/useSessionToken";
import useNotifications from "../../notifications/hooks/useNotifications";
import { useGetUserOnboardingQuery } from "../../intro/api/api";

import { RootStackParamList } from "./root/types";
import IntroNavigator from "./intro/IntroNavigator";
import RootNavigator from "./root/RootNavigator";
import SurveyStackNavigator, { 
  SurveyStackParamList 
} from "../../track/navigation/SurveyNavigator";
import IngredientsStackNavigator, { 
  IngredientsStackParamList 
} from "../../ingredients/navigation/IngredientsNavigator";
import HackVideoScreen from "../../hack/screens/HackVideoScreen";
import MakeItScreen from "../../make/screens/MakeItScreen";
import OnboardingNavigator from "./onboarding/OnboardingNavigator";

export type InitialStackParamList = {
  Intro: undefined;
  Onboarding: undefined;
  Root: NavigatorScreenParams<RootStackParamList> | undefined;
  Ingredients: NavigatorScreenParams<IngredientsStackParamList> | undefined;
  Survey: NavigatorScreenParams<SurveyStackParamList> | undefined;
  MakeIt: {
    id: string;
    variant: string;
    ingredients: {
      id: string;
      title: string;
      quantity: string;
      preparation?: string;
    }[];
    mealId: string;
  };
  HackVideo: { videoString: string }; // id: string
};

const InitialNavigationStack =
  createNativeStackNavigator<InitialStackParamList>();

export type InitialNavigationStackParams<
  Screen extends keyof InitialStackParamList
> = NativeStackScreenProps<InitialStackParamList, Screen>;

function InitialNavigator() {

  const accessToken = useAccessToken();

  const { data: userOnboarding } = useGetUserOnboardingQuery();

  const { permissionStatus, registerForNotifications } = useNotifications();

  useEffect(() => {
    if (userOnboarding) {
      if (permissionStatus === PermissionStatus.UNDETERMINED) {
        registerForNotifications();
      }
    }
  }, [userOnboarding, permissionStatus, registerForNotifications]);

  return (
    <InitialNavigationStack.Navigator initialRouteName="Root" screenOptions={{ headerShown: false }}>
      <InitialNavigationStack.Screen name="Intro" component={IntroNavigator} /> 
      <InitialNavigationStack.Screen name="Onboarding" component={OnboardingNavigator}/>
      <InitialNavigationStack.Screen name="Root" component={RootNavigator} />
      <InitialNavigationStack.Screen name="Ingredients" component={IngredientsStackNavigator}/>
      <InitialNavigationStack.Screen name="Survey" component={SurveyStackNavigator} />
      <InitialNavigationStack.Screen name="MakeIt"component={MakeItScreen}options={{title: 'Make it', headerShown: false}}/>
      <InitialNavigationStack.Screen name="HackVideo" component={HackVideoScreen}options={{ title: 'Video', headerShown: false, presentation: 'fullScreenModal', animation: 'fade', }} />
    </InitialNavigationStack.Navigator>
  );
}

export default InitialNavigator;