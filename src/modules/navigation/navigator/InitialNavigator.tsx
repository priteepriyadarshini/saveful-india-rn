import { NavigatorScreenParams } from "@react-navigation/native";
import React, { useEffect } from "react";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { PermissionStatus } from 'expo-modules-core';
import useAccessToken from "../../auth/hooks/useSessionToken";
import useNotifications from "../../notifications/hooks/useNotifications";
import { useGetCurrentUserQuery } from "../../auth/api";
import useAuthListener from "../../auth/hooks/useAuthListener";
import { useAppDispatch } from "../../../store/hooks";
import { clearSessionData } from "../../auth/sessionSlice";

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
import AuthScreen from "../../intro/screens/AuthScreen";
import OnboardingNavigator from "./onboarding/OnboardingNavigator";

export type InitialStackParamList = {
  Auth: undefined;
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
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp<InitialStackParamList>>();

  const { data: currentUser } = useGetCurrentUserQuery();
  
  // Check if user has completed onboarding based on having country set
  const hasCompletedOnboarding = currentUser?.country ? true : false;

  const { permissionStatus, registerForNotifications } = useNotifications();

  // Listen for auth state changes and handle automatic logout
  useAuthListener();

  // Navigate based on authentication state changes
  useEffect(() => {
    const determineRoute = () => {
      if (!accessToken) {
        return 'Auth';
      }
      if (!hasCompletedOnboarding) {
        return 'Onboarding';
      }
      return 'Root';
    };

    const targetRoute = determineRoute();
    console.log('Auth state changed, navigating to:', targetRoute, { accessToken: !!accessToken, hasCompletedOnboarding });
    
    // Reset navigation stack to the appropriate route
    navigation.reset({
      index: 0,
      routes: [{ name: targetRoute }],
    });
  }, [accessToken, hasCompletedOnboarding, navigation]);

  // Validate token on mount - immediately clear if invalid or expired
  useEffect(() => {
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const expirationTime = payload.exp * 1000;
        
        if (Date.now() >= expirationTime) {
          console.log('Token expired on app mount - clearing session');
          dispatch(clearSessionData());
        }
      } catch (error) {
        console.log('Invalid token format on app mount - clearing session');
        dispatch(clearSessionData());
      }
    }
  }, []);

  useEffect(() => {
    if (hasCompletedOnboarding) {
      if (permissionStatus === PermissionStatus.UNDETERMINED) {
        registerForNotifications();
      }
    }
  }, [hasCompletedOnboarding, permissionStatus, registerForNotifications]);

  // Determine initial route based on auth state
  const getInitialRoute = (): keyof InitialStackParamList => {
    if (!accessToken) {
      return 'Auth'; // Not authenticated - go directly to sign in
    }
    if (!hasCompletedOnboarding) {
      return 'Onboarding'; // Authenticated but no onboarding - show onboarding
    }
    return 'Root'; // Authenticated and onboarded - show main app
  };

  return (
    <InitialNavigationStack.Navigator initialRouteName={getInitialRoute()} screenOptions={{ headerShown: false }}>
      <InitialNavigationStack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
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