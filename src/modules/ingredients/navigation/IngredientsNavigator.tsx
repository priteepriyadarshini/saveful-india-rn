import { Feather } from "@expo/vector-icons";
import { CompositeScreenProps } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import tw from "../../../common/tailwind";
import IngredientDetailScreen from "../../../modules/ingredients/screens/IngredientDetailScreen";
import IngredientsResultsScreen from "../../../modules/ingredients/screens/IngredientsResults";
import IngredientsScreen from "../../../modules/ingredients/screens/IngredientsScreen";
import { InitialNavigationStackParams } from "../../navigation/navigator/InitialNavigator";
import React from "react";
import { Pressable } from "react-native";
import PrepScreen from "../../prep/screens/PrepScreen";

export type IngredientsStackParamList = {
  IngredientsHome: undefined;
  IngredientDetail: { id: string };
  IngredientsResults: { selectedIngredients: { id: string; title: string }[] };
  PrepDetail: { slug: string };
};

export type IngredientsStackScreenProps<
  Screen extends keyof IngredientsStackParamList,
> = CompositeScreenProps<
  NativeStackScreenProps<IngredientsStackParamList, Screen>,
  InitialNavigationStackParams<"Ingredients">
>;

const NavigationStack = createNativeStackNavigator<IngredientsStackParamList>();

export default function IngredientsStackNavigator() {
  return (
    <NavigationStack.Navigator
      screenOptions={({ navigation }) => ({
        detachPreviousScreen: !navigation.isFocused(),
        headerTintColor: tw.color("gray-900"),
      })}
    >
      <NavigationStack.Screen
        name="IngredientsHome"
        component={IngredientsScreen}
        options={{ title: "Ingredients", headerShown: false }}
      />

      <NavigationStack.Screen
        name="IngredientDetail"
        component={IngredientDetailScreen}
        options={{ title: "Ingredients detail", headerShown: false }}
      />

      <NavigationStack.Screen
        name="IngredientsResults"
        component={IngredientsResultsScreen}
        options={({ navigation }) => ({
          title: "",
          headerTransparent: true,
          headerBackButtonMenuEnabled: false,
          headerBackTitleVisible: false,
          headerLeft: () => (
            <Pressable
              style={tw`flex h-11 w-5 items-center justify-center`}
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
            >
              <Feather name="arrow-left" color="black" size={20} />
            </Pressable>
          ),
        })}
      />

      <NavigationStack.Screen
        name="PrepDetail"
        component={PrepScreen}
        options={{ title: "Recipe", headerShown: false }}
      />
    </NavigationStack.Navigator>
  );
}
