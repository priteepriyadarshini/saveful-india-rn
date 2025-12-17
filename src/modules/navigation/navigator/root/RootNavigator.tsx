import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import TabBar from "../../components/TabBar";
import { RootStackParamList } from "./types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import FeedStackNavigator from "../../../feed/navigation/FeedNavigation";
import MakeStackNavigator from "../../../make/navigation/MakeNavigation";
import HackStackNavigator from "../../../hack/navigation/HackNavigation";
import TrackStackNavigator from "../../../track/navigation/TrackNavigation";

export type RootNavigationStackParams<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;

const RootNavigationTabBar = createBottomTabNavigator<RootStackParamList>();
function RootNavigator() {
  return (
    <RootNavigationTabBar.Navigator
      initialRouteName="Feed"
      tabBar={(props: BottomTabBarProps) => <TabBar {...props} />}
    >
      <RootNavigationTabBar.Screen
        name="Feed"
        component={FeedStackNavigator}
        options={() => ({
          headerShown: false,
        })}
      />
      <RootNavigationTabBar.Screen
        name="Make" // CAPITAL "M"
        component={MakeStackNavigator} 
        options={{ headerShown: false }}
      />
      <RootNavigationTabBar.Screen
        name="Hack"
        component={HackStackNavigator}
        options={() => ({
          headerShown: false,
        })}
      />
      <RootNavigationTabBar.Screen
        name="Track"
        component={TrackStackNavigator}
        options={() => ({
          headerShown: false,
        })}
      />
    </RootNavigationTabBar.Navigator>
  );
}
export default RootNavigator;
