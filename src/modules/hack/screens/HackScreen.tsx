import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ScrollView,
  Text,
  View,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "../../../common/tailwind";
import { bodyMediumRegular, h2TextStyle } from "../../../theme/typography";
import FocusAwareStatusBar from "../../../common/components/FocusAwareStatusBar";
import HackCategory from "../components/HackCategory";
import useAnalytics from "../../analytics/hooks/useAnalytics";
import { hackApiService, HackCategory as ApiHackCategory } from "../api/hackApiService";

const windowWidth = Dimensions.get('window').width;
const windowScreenWidth = Dimensions.get('screen').width;

export default function HackScreen() {
  const [apiCategories, setApiCategories] = useState<ApiHackCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [useApiData, setUseApiData] = useState<boolean>(false);

  const offset = useRef(new Animated.Value(0)).current;
  const { sendScrollEventInitiation } = useAnalytics();

  const getCategoriesData = useCallback(async () => {
    try {
      const apiData = await hackApiService.getAllCategories();
      if (apiData && apiData.length > 0) {
        setApiCategories(apiData);
        setUseApiData(true);
      }
    } catch (error) {
      console.error('Error fetching hack categories:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getCategoriesData();
  }, [getCategoriesData]);

  const bgImageHeight = useMemo(() => (windowScreenWidth * 392) / 375, []);
  const ribbonImageHeight = useMemo(() => (windowScreenWidth * 1085) / 375, []);

  const renderedCategories = useMemo(() => {
    return apiCategories.map(item => {
      const key = item._id || item.id || item.name;
      return <HackCategory key={key} item={item} useApiData={true} />;
    });
  }, [apiCategories]);

  return (
    <View style={tw`relative flex-1 bg-creme`}>
      <Image
        source={require('../../../../assets/hacks/female-cook-cutting-ingredients.png')}
        resizeMode="cover"
        style={tw.style(
          `absolute top-0 w-[${windowWidth}px] bg-eggplant h-[${bgImageHeight}px]`,
        )}
      />
      {!isLoading && (
        <ScrollView
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: offset } } }],
            {
              useNativeDriver: false,
              listener: (event: NativeSyntheticEvent<NativeScrollEvent>) =>
                sendScrollEventInitiation(event, 'Hack Page Interacted'),
            },
          )}
          showsVerticalScrollIndicator={false}
        >
          <View style={tw`pt-15 z-10`}>
            <SafeAreaView style={tw`px-15`}>
            <Text style={tw.style(h2TextStyle, 'text-center text-white')}>
              Hacks
            </Text>
            <Text
              style={tw.style(bodyMediumRegular, 'mt-4 text-center text-white')}
            >
              Unlock a smorgasbord of chef’s tips on how to stretch, store and
              repurpose your food.
            </Text>
          </SafeAreaView>

          <View style={tw`mt-15 relative z-10`}>
            <View style={tw`absolute mt-[200px] h-full w-full bg-creme`}>
              <Image
                source={require('../../../../assets/ribbons/curly-eggplant.png')}
                style={tw`absolute w-[${windowWidth}px] h-[${ribbonImageHeight}px] top-24`}
                resizeMode="contain"
              />
            </View>
            {renderedCategories}
            </View>
          </View>
        </ScrollView>
      )}

      <FocusAwareStatusBar statusBarStyle="light" />
    </View>
  );
}
