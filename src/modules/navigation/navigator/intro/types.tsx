import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type IntroStackParamList = {
  IntroHome: undefined;
  Auth: undefined;
  Onboarding: undefined;
  PostOnboarding: undefined;
};

export type IntroStackScreenProps<Screen extends keyof IntroStackParamList> =
  NativeStackScreenProps<IntroStackParamList, Screen>;
