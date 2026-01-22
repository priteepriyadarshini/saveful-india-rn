import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type IntroNavigatorStackParamList = {
  IntroHome: undefined;
  AuthScreen: undefined;
  OTPVerificationScreen: {
    email: string;
    name: string;
  };
  Onboarding: undefined;
  PostOnboarding: undefined;
};

export type IntroStackParamList = IntroNavigatorStackParamList;

export type IntroStackScreenProps<Screen extends keyof IntroStackParamList> =
  NativeStackScreenProps<IntroStackParamList, Screen>;
