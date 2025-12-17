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
import useContent from "../../../common/hooks/useContent";
import { ICategory } from "../../../models/craft";
import { useEffect, useRef, useState } from "react";
import useAnalytics from "../../analytics/hooks/useAnalytics";

export default function HackScreen() {
  const { getCategories } = useContent();
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const offset = useRef(new Animated.Value(0)).current;
  const { sendScrollEventInitiation } = useAnalytics();

  const getCategoriesData = async () => {
    const data = await getCategories();

    if (data) {
      // Only hack categories
      setCategories(data.filter(item => item.groupHandle === 'hack'));
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCategoriesData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // TODO: Loading skeleton
  if (isLoading) {
    return null;
  }

  return (
    <View style={tw`relative flex-1 bg-creme`}>
      <Image
        source={require('../../../../assets/hacks/female-cook-cutting-ingredients.png')}
        resizeMode="cover"
        style={tw.style(
          `absolute top-0 w-[${
            Dimensions.get('window').width
          }px] bg-eggplant h-[${
            (Dimensions.get('screen').width * 392) / 375
          }px]`,
        )}
      />
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
        <View style={tw`pt-15 z-10 flex-1`}>
          <SafeAreaView style={tw`px-15 flex-1`}>
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
                style={tw`absolute w-[${Dimensions.get('window').width}px] h-[${
                  (Dimensions.get('screen').width * 1085) / 375
                }px] top-24`}
                resizeMode="contain"
              />
            </View>
            {categories.map(item => {
              return <HackCategory key={item.id} item={item} />;
            })}
          </View>
        </View>
      </ScrollView>

      <FocusAwareStatusBar statusBarStyle="light" />
    </View>
  );
}
