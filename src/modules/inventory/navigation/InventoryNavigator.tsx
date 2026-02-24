import { CompositeScreenProps } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import React from "react";
import tw from "../../../common/tailwind";
import { InitialNavigationStackParams } from "../../navigation/navigator/InitialNavigator";
import InventoryScreen from "../screens/InventoryScreen";
import VoiceAddScreen from "../screens/VoiceAddScreen";
import MealSuggestionsScreen from "../screens/MealSuggestionsScreen";
import ExpiringItemsScreen from "../screens/ExpiringItemsScreen";
import WasteAnalyticsScreen from "../screens/WasteAnalyticsScreen";

export type InventoryStackParamList = {
  InventoryHome: undefined;
  InventoryVoiceAdd: undefined;
  InventoryMealSuggestions: { country?: string };
  InventoryExpiring: { days?: number };
  InventoryWasteAnalytics: undefined;
};

export type InventoryStackScreenProps<
  Screen extends keyof InventoryStackParamList,
> = CompositeScreenProps<
  NativeStackScreenProps<InventoryStackParamList, Screen>,
  InitialNavigationStackParams<"Inventory">
>;

const NavigationStack = createNativeStackNavigator<InventoryStackParamList>();

export default function InventoryStackNavigator() {
  return (
    <NavigationStack.Navigator
      screenOptions={({ navigation }) => ({
        detachPreviousScreen: !navigation.isFocused(),
        headerTintColor: tw.color("gray-900"),
      })}
    >
      <NavigationStack.Screen
        name="InventoryHome"
        component={InventoryScreen}
        options={{ title: "My Pantry", headerShown: false }}
      />

      <NavigationStack.Screen
        name="InventoryVoiceAdd"
        component={VoiceAddScreen}
        options={{ headerShown: false }}
      />

      <NavigationStack.Screen
        name="InventoryMealSuggestions"
        component={MealSuggestionsScreen}
        options={{ headerShown: false }}
      />

      <NavigationStack.Screen
        name="InventoryExpiring"
        component={ExpiringItemsScreen}
        options={{ headerShown: false }}
      />

      <NavigationStack.Screen
        name="InventoryWasteAnalytics"
        component={WasteAnalyticsScreen}
        options={{ headerShown: false }}
      />
    </NavigationStack.Navigator>
  );
}
