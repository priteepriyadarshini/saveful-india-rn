import { CompositeScreenProps } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import tw from '../../../common/tailwind';
import PostMakeScreen from '../../../modules/track/screens/PostMakeScreen';
import SurveyScreen from '../../../modules/track/screens/SurveyScreen';
import ResultsScreen from '../screens/ResultsScreen';
import React from 'react';
import { InitialNavigationStackParams } from '../../navigation/navigator/InitialNavigator';

export type SurveyStackParamList = {
  PostMake: { id: string };
  SurveyWeekly: undefined;
  Results: undefined;
};

export type SurveyStackScreenProps<Screen extends keyof SurveyStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<SurveyStackParamList, Screen>,
    InitialNavigationStackParams<'Survey'>
  >;

const NavigationStack = createNativeStackNavigator<SurveyStackParamList>();

export default function SurveyStackNavigator() {
  return (
    <NavigationStack.Navigator
      screenOptions={({ navigation }) => ({
        detachPreviousScreen: !navigation.isFocused(),
        headerTintColor: tw.color('gray-900'),
      })}
    >
      <NavigationStack.Screen
        name="PostMake"
        component={PostMakeScreen}
        options={() => ({
          headerShown: false,
          presentation: 'modal',
        })}
      />
      <NavigationStack.Screen
        name="SurveyWeekly"
        component={SurveyScreen}
        options={() => ({
          headerShown: false,
          presentation: 'modal',
        })}
      />
      <NavigationStack.Screen
        name="Results"
        component={ResultsScreen}
        options={() => ({
          headerShown: false,
          presentation: 'modal',
        })}
      />
    </NavigationStack.Navigator>
  );
}
