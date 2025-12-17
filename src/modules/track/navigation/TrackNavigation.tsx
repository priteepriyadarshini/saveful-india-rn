import { Feather } from '@expo/vector-icons';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import tw from '../../../common/tailwind';
import { RootNavigationStackParams } from '../../navigation/navigator/root/RootNavigator';
import ChangePasswordScreen from '../../../modules/track/screens/ChangePasswordScreen';
import ProfileHistoryScreen from '../../../modules/track/screens/ProfileHistory';
import ProfileScreen from '../../../modules/track/screens/ProfileScreen';
import SettingsAccountsScreen from '../../../modules/track/screens/SettingsAccountsScreen';
import SettingsDetailsOnboardingDietaryScreen from '../../../modules/track/screens/SettingsDetailsOnboardingDietaryScreen';
import SettingsDetailsScreen from '../../../modules/track/screens/SettingsDetailsScreen';
import SettingsNotificationsScreen from '../../../modules/track/screens/SettingsNotificationsScreen';
import SettingsSavefulScreen from '../../../modules/track/screens/SettingsSavefulScreen';
import SettingsScreen from '../../../modules/track/screens/SettingsScreen';
import TrackScreen from '../screens/TrackScreen';
import React from 'react';
import { Pressable, View } from 'react-native';
import { SurveyStackParamList } from './SurveyNavigator';


export type TrackStackParamList = {
  TrackHome: undefined;
  TrackFeed: undefined;
  Settings: { isChangePasswordUpdated: boolean };
  SettingsDetails: { isChangePasswordUpdated: boolean };
  SettingsSaveful: undefined;
  SettingsNotifications: undefined;
  SettingsAccounts: undefined;
  SettingsAccountsQantasLink: { hideRibbon?: string };
  SettingsDetailsOnboardingDietary: undefined;
  Profile: undefined;
  ProfileHistory: { id: string };
  ChangePassword: undefined;
  PostMake: { id: string };
  Survey: NavigatorScreenParams<SurveyStackParamList>;
  Results: undefined;
};

export type TrackStackScreenProps<Screen extends keyof TrackStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<TrackStackParamList, Screen>,
    RootNavigationStackParams<'Track'>
  >;

const NavigationStack = createNativeStackNavigator<TrackStackParamList>();

export default function TrackStackNavigator() {
  return (
    <NavigationStack.Navigator
      screenOptions={({ navigation }) => ({
        detachPreviousScreen: !navigation.isFocused(),
        headerTintColor: tw.color('gray-900'),
      })}
    >
      <NavigationStack.Screen
        name="TrackHome"
        component={TrackScreen}
        options={{ title: 'Track', headerShown: false }}
      />
      <NavigationStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <NavigationStack.Screen
        name="ProfileHistory"
        component={ProfileHistoryScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <NavigationStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <NavigationStack.Screen
        name="SettingsDetails"
        component={SettingsDetailsScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <NavigationStack.Screen
        name="SettingsSaveful"
        component={SettingsSavefulScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <NavigationStack.Screen
        name="SettingsNotifications"
        component={SettingsNotificationsScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <NavigationStack.Screen
        name="SettingsAccounts"
        component={SettingsAccountsScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <NavigationStack.Screen
        name="SettingsDetailsOnboardingDietary"
        component={SettingsDetailsOnboardingDietaryScreen}
        options={({ navigation }) => ({
          title: '',
          headerTransparent: true,
          headerBackButtonMenuEnabled: false,
          headerBackTitleVisible: false,
          headerLeft: () => <View />,
          headerRight: () => (
            <Pressable
              style={tw`flex h-11 w-5 items-center justify-center`}
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
            >
              <Feather name="x" color="black" size={20} />
            </Pressable>
          ),
        })}
      />
      <NavigationStack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={({ navigation }) => ({
          title: '',
          headerTransparent: true,
          headerBackButtonMenuEnabled: false,
          headerBackTitleVisible: false,
          headerLeft: () => <View />,
          headerRight: () => (
            <Pressable
              style={tw`flex h-11 w-5 items-center justify-center`}
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
            >
              <Feather name="x" color="black" size={20} />
            </Pressable>
          ),
          presentation: 'modal',
        })}
      />
    </NavigationStack.Navigator>
  );
}
