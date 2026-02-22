import {Feather} from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import DebouncedPressable from "../../../common/components/DebouncePressable";
import FocusAwareStatusBar from "../../../common/components/FocusAwareStatusBar";
import tw from "../../../common/tailwind";
import { hackApiService, HackCategory as ApiHackCategory, Hack } from "../api/hackApiService";
import { mixpanelEventName } from "../../analytics/analytics";
import useAnalytics from "../../analytics/hooks/useAnalytics";
import AnimatedHacksHeader from "../components/AnimatedHacksHeader";
import HackFavorite from '../../../modules/hack/components/HackFavorite';
import { 
  HackStackScreenProps, 
  HackStackParamList 
} from "../navigation/HackNavigation";
import { useCurentRoute } from "../../route/context/CurrentRouteContext";
import React, { useRef, useState, useEffect } from "react";
import { 
  Animated, 
  View, 
  Dimensions, 
  ScrollView, 
  NativeSyntheticEvent, 
  NativeScrollEvent,
  Text,
  Image,
} from "react-native";
import { 
  h2TextStyle, 
  h7TextStyle, 
  bodySmallRegular, 
  subheadMediumUppercase 
} from "../../../theme/typography";


export default function HackCategoryScreen({
  route: {
    params: { id },
  },
}: HackStackScreenProps<'HackCategory'>) {
  const offset = useRef(new Animated.Value(0)).current;
  
  const navigation =
    useNavigation<NativeStackNavigationProp<HackStackParamList>>();

  const { sendScrollEventInitiation, sendAnalyticsEvent } = useAnalytics();
  const { newCurrentRoute } = useCurentRoute();
  const [apiCategory, setApiCategory] = useState<ApiHackCategory>();
  const [apiHacks, setApiHacks] = useState<Hack[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getCategoriesData = async () => {
    try {
      const apiData = await hackApiService.getCategoryWithHacks(id);
      if (apiData) {
        setApiCategory(apiData.category);
        setApiHacks(apiData.hacks);
      }
    } catch (error) {
      console.error('Error fetching hack category:', error);
    } finally {
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

  if (!apiCategory) {
    return null;
  }

  const categoryTitle = apiCategory.name;
  const categoryHeroImage = apiCategory.heroImageUrl;

  return (
    <View style={tw`relative flex-1 bg-creme`}>
      <AnimatedHacksHeader animatedValue={offset} title={categoryTitle} />
      {categoryHeroImage && (
        <>
          <Image
            source={{ uri: categoryHeroImage }}
            resizeMode="cover"
            style={tw.style(
              `absolute top-0 w-[${
                Dimensions.get('window').width
              }px] bg-eggplant h-[${
                (Dimensions.get('screen').width * 260) / 375
              }px]`,
            )}
          />
          <View
            style={tw.style(
              `absolute top-0 w-[${
                Dimensions.get('window').width
              }px] bg-eggplant opacity-40 h-[${
                (Dimensions.get('screen').width * 260) / 375
              }px]`,
            )}
          />
        </>
      )}
      <ScrollView
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: offset } } }],
          {
            useNativeDriver: false,
            listener: (event: NativeSyntheticEvent<NativeScrollEvent>) =>
              sendScrollEventInitiation(event, 'Hack Category Interacted'),
          },
        )}
      >
        <View style={tw`z-10 w-full flex-1 py-5`}>
          <View style={tw`h-21 z-10 mb-5 justify-center px-5`}>
            <Text
              style={tw.style(h2TextStyle, 'text-center text-white')}
              maxFontSizeMultiplier={1}
            >
              {categoryTitle}
            </Text>
          </View>
          <View style={tw`relative z-10`}>
            <View style={tw`absolute mt-12 h-full w-full bg-creme`} />
            <View style={tw`px-5`}>
              {apiHacks.map(item => {
                  return (
                    <View key={item._id}>
                      <DebouncedPressable
                        onPress={() => {
                          sendAnalyticsEvent({
                            event: mixpanelEventName.actionClicked,
                            properties: {
                              location: newCurrentRoute,
                              action: mixpanelEventName.hackDetailViewed,
                              fromCategory: categoryTitle,
                              id: item._id,
                              hackTitle: item.title,
                            },
                          });
                          navigation.navigate('HackDetail', { categoryId: id, id: item._id });
                        }}
                        style={tw.style(
                          'my-4 items-center rounded-[10px] border border-radish',
                        )}
                      >
                        {item.thumbnailImageUrl && (
                          <Image
                            source={{ uri: item.thumbnailImageUrl }}
                            style={tw.style('h-[174px] w-full rounded-t-[10px]')}
                            resizeMode="cover"
                          />
                        )}
                        <View
                          style={tw.style(
                            'w-full items-center rounded-b-[10px] border-t border-radish bg-white p-6',
                          )}
                        >
                          <Text style={tw.style(h7TextStyle, 'text-center')}>
                            {item.title}
                          </Text>
                          {item.shortDescription && (
                            <Text style={tw.style(
                              bodySmallRegular,
                              'pt-2 text-center text-midgray',
                            )}>
                              {item.shortDescription}
                            </Text>
                          )}
                          <View
                            style={tw.style('mt-4 flex-row items-center gap-2')}
                          >
                            <HackFavorite id={item._id} dark />
                            <View
                              style={tw.style(
                                'flex-row items-center justify-center rounded-[11px] bg-mint px-4 py-1',
                              )}
                            >
                              <Feather name="book" color="black" size={16} />
                              <Text
                                style={[
                                  tw.style(subheadMediumUppercase, 'ml-1.5'),
                                ]}
                              >
                                read all about it
                              </Text>
                            </View>
                          </View>
                        </View>
                      </DebouncedPressable>
                    </View>
                  );
                })}
            </View>
          </View>
        </View>
      </ScrollView>
      <FocusAwareStatusBar statusBarStyle="light" />
    </View>
  );
}
