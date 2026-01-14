import React, { useCallback, useState } from "react";
import { 
  Image, 
  Dimensions, 
  NativeScrollEvent, 
  NativeSyntheticEvent, 
  ScrollView, 
  View,
  Pressable 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import tw from "../../../common/tailwind";
import { useLinkTo, useNavigation } from "@react-navigation/native";
import useAnalytics from "../../analytics/hooks/useAnalytics";
import { mixpanelEventName } from "../../analytics/analytics";
import { useCurentRoute } from "../../route/context/CurrentRouteContext";
import FocusAwareStatusBar from "../../../common/components/FocusAwareStatusBar";
import FeedSearchBarHeader from "../components/FeedSearchBarHeader";
import FeedNotification from "../components/FeedNotification";
import CommunityGroups from "../components/CommunityGroups";
import Staples from "../components/Staples";
import Partners from "../components/Partners";
import FeedSaved from "../components/FeedSaved";
import IngredientsCarousel from "../components/IngredientsCarousel";
import MealsCarousel from "../components/MealsCarousel";
import { IngredientsStackScreenProps } from "../../ingredients/navigation/IngredientsNavigator";
import { FeedStackScreenProps } from "../navigation/FeedNavigation";


const screenWidth = Dimensions.get('window').width;
const heroImageHeight = (Dimensions.get('screen').width * 400) / 374;

export default function FeedScreen() {
  //const linkTo = useLinkTo();
  const navigation = useNavigation<FeedStackScreenProps<'FeedHome'>['navigation']>();
  const {
    sendAnalyticsEvent,
    sendScrollEventInitiation,
    // sendFailedEventAnalytics,
  } = useAnalytics();
  const { newCurrentRoute } = useCurentRoute();

  const onSearchTapped = useCallback(() => {
    sendAnalyticsEvent({
      event: mixpanelEventName.actionClicked,
      properties: {
        location: newCurrentRoute,
        action: mixpanelEventName.searchbarPressed,
      },
    });
    //linkTo('/Ingredients');
    navigation.navigate('Ingredients', {
      screen: 'IngredientsHome',
      params: undefined,
    });
  }, [navigation, newCurrentRoute, sendAnalyticsEvent]);

  const onLeaderboardTapped = useCallback(() => {
    sendAnalyticsEvent({
      event: mixpanelEventName.actionClicked,
      properties: {
        location: newCurrentRoute,
        action: 'leaderboard_icon_pressed',
      },
    });
    navigation.navigate('Leaderboard');
  }, [navigation, newCurrentRoute, sendAnalyticsEvent]);

  const onShoppingListTapped = useCallback(() => {
    sendAnalyticsEvent({
      event: mixpanelEventName.actionClicked,
      properties: {
        location: newCurrentRoute,
        action: 'shopping_list_icon_pressed',
      },
    });
    navigation.navigate('ShoppingList');
  }, [navigation, newCurrentRoute, sendAnalyticsEvent]);

  const [_isNotification, setIsNotification] = useState<boolean>(false);


  return (
    <View style={tw`relative flex-1 bg-creme`}>
      <View
        style={tw.style(
          `absolute top-0 w-[${screenWidth}px] h-[${heroImageHeight}px]`,
        )}
      >
        <Image
          resizeMode="cover"
          style={tw.style(`h-full w-full bg-eggplant`)}
          source={require('../../../../assets/ribbons/eggplant-tall.png')}
        />
      </View>
      <ScrollView
        scrollEventThrottle={1}
        onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
          sendScrollEventInitiation(event, 'Feed Page Interacted');
        }}
        showsVerticalScrollIndicator={false}
      >
        <SafeAreaView style={tw`z-10 pt-[30px]`}>
          {/* Survey Notification - appears when there are pending surveys */}
         
          
          {/* Icons - Top Right */}
          <View style={tw`flex-row items-center justify-end px-5 mb-3`}>
            <Pressable
              onPress={onShoppingListTapped}
              style={tw`h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg mr-3`}
              accessibilityRole="button"
              accessibilityLabel="Open shopping list"
            >
              <Ionicons name="list" size={20} color={tw.color('eggplant')} />
            </Pressable>
            
            <Pressable
              onPress={onLeaderboardTapped}
              style={tw`h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg`}
              accessibilityRole="button"
              accessibilityLabel="Open leaderboard"
            >
              <Ionicons name="trophy" size={20} color={tw.color('eggplant')} />
            </Pressable>
          </View>

          <FeedSearchBarHeader
            onPress={onSearchTapped}
            title="What are you cooking with?"
          />
 <FeedNotification setIsNotification={setIsNotification} />
          <View style={tw`-mb-12 mt-10`}>
            <FeedSaved
            />
          </View>

        </SafeAreaView>

        <View style={tw`pt-15 bg-creme`}>
          
          <IngredientsCarousel />

          <CommunityGroups />

          {/* <QantasBlock /> */}

          <MealsCarousel />

          {/* <Video />  */}

          {/* <Staples /> */}

          <Partners />

        </View>

      </ScrollView>

      <FocusAwareStatusBar statusBarStyle="light" />
    </View>
  );
}
