import React, { useCallback, useState } from "react";
import { 
  Image, 
  Dimensions, 
  NativeScrollEvent, 
  NativeSyntheticEvent, 
  ScrollView, 
  View 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "../../../common/tailwind";
import { useLinkTo, useNavigation } from "@react-navigation/native";
import useAnalytics from "../../analytics/hooks/useAnalytics";
import { mixpanelEventName } from "../../analytics/analytics";
import { useCurentRoute } from "../../route/context/CurrentRouteContext";
import FocusAwareStatusBar from "../../../common/components/FocusAwareStatusBar";
import FeedSearchBarHeader from "../components/FeedSearchBarHeader";
import CommunityGroups from "../components/CommunityGroups";
import Staples from "../components/Staples";
import Partners from "../components/Partners";
import FeedSaved from "../components/FeedSaved";
import IngredientsCarousel from "../components/IngredientsCarousel";
import MealsCarousel from "../components/MealsCarousel";
import { IngredientsStackScreenProps } from "../../ingredients/navigation/IngredientsNavigator";


const screenWidth = Dimensions.get('window').width;
const heroImageHeight = (Dimensions.get('screen').width * 400) / 374;

export default function FeedScreen() {
  //const linkTo = useLinkTo();
  const navigation = useNavigation<IngredientsStackScreenProps<'IngredientsHome'>['navigation']>();
  const {
    sendAnalyticsEvent,
    sendScrollEventInitiation,
    // sendFailedEventAnalytics,
  } = useAnalytics();
  const { newCurrentRoute } = useCurentRoute();


    sendAnalyticsEvent({
      event: mixpanelEventName.actionClicked,
      properties: {
        location: newCurrentRoute,
        action: mixpanelEventName.searchbarPressed,
      },
    });  const onSearchTapped = useCallback(() => {
    //linkTo('/Ingredients');
    navigation.navigate('Ingredients');
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
          <FeedSearchBarHeader
            onPress={onSearchTapped}
            title="What are you cooking with?"
          />

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
