import { NavigatorScreenParams } from "@react-navigation/native";
import { MakeStackParamList } from "../../../make/navigation/MakeNavigation";
import { FeedStackParamList } from "../../../feed/navigation/FeedNavigation";

export type RootStackParamList = {
  //ExampleHome: undefined;
  //Developer: undefined;
  //Feed: undefined;
  Feed: { screen?: keyof FeedStackParamList };
  //Make: undefined;
  Make: NavigatorScreenParams<MakeStackParamList>;
  Hack: undefined;
  Track: undefined;
};
