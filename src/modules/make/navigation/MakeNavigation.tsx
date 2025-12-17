import { CompositeScreenProps } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import tw from "../../../common/tailwind";
import FrameworkNotFoundScreen from "../../deep_linking/screens/FrameworkNotFoundScreen";
import MakeScreen from "../screens/MakeScreen";
import PrepScreen from "../../prep/screens/PrepScreen";
import { RootNavigationStackParams } from "../../navigation/navigator/root/RootNavigator";
import React from "react";
import MakeItScreen from "../screens/MakeItScreen";

export type MakeStackParamList = {
  MakeHome: undefined;
  PrepDetail: { slug: string };
  FrameworkNotFound: undefined;
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
};

export type MakeStackScreenProps<Screen extends keyof MakeStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<MakeStackParamList, Screen>,
    RootNavigationStackParams<"Make">
  >;

const NavigationStack = createNativeStackNavigator<MakeStackParamList>();

export default function MakeStackNavigator() {
  return (
    <NavigationStack.Navigator
      screenOptions={({ navigation }) => ({
        detachPreviousScreen: !navigation.isFocused(),
        headerTintColor: tw.color("gray-900"),
      })}
    >
      <NavigationStack.Screen
        name="MakeHome"
        component={MakeScreen}
        options={{ title: "Make", headerShown: false }}
      />

      <NavigationStack.Screen
        name="PrepDetail"
        component={PrepScreen}
        options={{ title: "Make", headerShown: false }}
      />

      <NavigationStack.Screen
        name="FrameworkNotFound"
        component={FrameworkNotFoundScreen}
        options={{ title: "Make", headerShown: false }}
      />

      <NavigationStack.Screen
        name="MakeIt"
        component={MakeItScreen}
        options={{
          title: 'Make it',
          headerShown: false,
        }}
      />

    </NavigationStack.Navigator>
  );
}
