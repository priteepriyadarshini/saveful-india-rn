import React from 'react';
import { CompositeScreenProps } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import tw from '../../../common/tailwind';
import { RootNavigationStackParams } from '../../navigation/navigator/root/RootNavigator';
import HackScreen from '../../../modules/hack/screens/HackScreen';
import HackCategoryScreen from '../screens/HackCategoryScreen';
import HackDetailScreen from '../screens/HackDetailScreen';
import HackVideoScreen from '../screens/HackVideoScreen';

export type HackStackParamList = {
  HackHome: undefined;
  HackCategory: { id: string };
  HackDetail: { categoryId: string; id: string };
  HackVideo: { videoString: string };
};

export type HackStackScreenProps<Screen extends keyof HackStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<HackStackParamList, Screen>,
    RootNavigationStackParams<'Hack'>
  >;

const NavigationStack = createNativeStackNavigator<HackStackParamList>();

export default function HackStackNavigator() {
  return (
    <NavigationStack.Navigator
      screenOptions={({ navigation }) => ({
        detachPreviousScreen: !navigation.isFocused(),
        headerTintColor: tw.color('gray-900'),
      })}
    >
      <NavigationStack.Screen
        name="HackHome"
        component={HackScreen}
        options={{ title: 'Hack', headerShown: false }}
      />
      <NavigationStack.Screen
        name="HackCategory"
        component={HackCategoryScreen}
        options={{ title: 'Hack Category', headerShown: false }}
      />
      <NavigationStack.Screen
        name="HackDetail"
        component={HackDetailScreen}
        options={{ title: 'Hack Detail', headerShown: false }}
      />
      <NavigationStack.Screen
        name="HackVideo"
        component={HackVideoScreen}
        options={{
          title: 'Hack Video',
          headerShown: false,
          presentation: 'fullScreenModal',
          animation: 'fade',
        }}
      />
    </NavigationStack.Navigator>
  );
}
