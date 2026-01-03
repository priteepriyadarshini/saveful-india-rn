import {Feather} from '@expo/vector-icons';
import { useLinkTo, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import DebouncedPressable from "../../../common/components/DebouncePressable";
import FocusAwareStatusBar from "../../../common/components/FocusAwareStatusBar";
import frameworkDeepLink from "../../../common/helpers/frameworkDeepLink";
import { bundledSource } from "../../../common/helpers/uriHelpers";
import useContent from "../../../common/hooks/useContent";
import tw from "../../../common/tailwind";
import { ICategory, IArticleContent, IVideoContent } from "../../../models/craft";
import { mixpanelEventName } from "../../analytics/analytics";
import useEnvironment from "../../environment/hooks/useEnvironment";
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
import RenderHTML from 'react-native-render-html';
import { 
  h2TextStyle, 
  h7TextStyle, 
  tagStyles, 
  bodySmallRegular, 
  subheadMediumUppercase 
} from "../../../theme/typography";
import { hackApiService, HackCategory as ApiHackCategory, Hack } from "../api/hackApiService";


export default function HackCategoryScreen({
  route: {
    params: { id },
  },
}: HackStackScreenProps<'HackCategory'>) {
  const env = useEnvironment();
  const offset = useRef(new Animated.Value(0)).current;
  
  const navigation =
    useNavigation<NativeStackNavigationProp<HackStackParamList>>();

  const { sendScrollEventInitiation, sendAnalyticsEvent } = useAnalytics();
  const { newCurrentRoute } = useCurentRoute();
  const { getCategory, getArticleContents, getVideoContents } = useContent();
  const [category, setCategory] = useState<ICategory>();
  const [apiCategory, setApiCategory] = useState<ApiHackCategory>();
  const [articles, setArticles] = useState<IArticleContent[]>([]);
  const [videos, setVideos] = useState<IVideoContent[]>([]);
  const [apiHacks, setApiHacks] = useState<Hack[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [useApiData, setUseApiData] = useState<boolean>(false);

  const getCategoriesData = async () => {
    try {
      // Try API first
      const apiData = await hackApiService.getCategoryWithHacks(id);
      if (apiData) {
        setApiCategory(apiData.category);
        setApiHacks(apiData.hacks);
        setUseApiData(true);
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.log('API not available, falling back to static content:', error);
    }

    // Fallback to static content
    const data = await getCategory(id);

    if (data) {
      setCategory(data);
      setUseApiData(false);
      setIsLoading(false);
    }
  };

  const getArticlesData = async () => {
    if (useApiData) return;
    const data = await getArticleContents();

    if (data) {
      setArticles(data.filter(item => item.hackCategory[0].id === id));
    }
  };

  const getVideosData = async () => {
    if (useApiData) return;
    const data = await getVideoContents();

    if (data) {
      setVideos(data.filter(item => item.hackCategory[0].id === id));
    }
  };

  useEffect(() => {
    getCategoriesData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!useApiData) {
      getArticlesData();
      getVideosData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useApiData]);

  // TODO: Loading skeleton
  if (isLoading) {
    return null;
  }

  if (!useApiData && !category) {
    return null;
  }

  if (useApiData && !apiCategory) {
    return null;
  }

  const data = useApiData ? [] : [...articles, ...videos];
  const categoryTitle = useApiData ? apiCategory!.name : category!.title;
  const categoryHeroImage = useApiData ? apiCategory!.heroImageUrl : (category!.heroImage ? category!.heroImage[0].url : null);

  return (
    <View style={tw`relative flex-1 bg-creme`}>
      <AnimatedHacksHeader animatedValue={offset} title={categoryTitle} />
      {categoryHeroImage && (
        <>
          <Image
            source={useApiData ? { uri: categoryHeroImage } : bundledSource(
              categoryHeroImage,
              env.useBundledContent,
            )}
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
              {useApiData ? (
                // Render API hacks
                apiHacks.map(item => {
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
                          // Navigate to hack detail (will need to implement)
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
                })
              ) : (
                // Render static content
                data.map(item => {
                  return (
                    <View key={item.id}>
                      <DebouncedPressable
                        onPress={() => {
                          if (item.videoUrl) {
                            sendAnalyticsEvent({
                              event: mixpanelEventName.actionClicked,
                              properties: {
                                location: newCurrentRoute,
                                action: mixpanelEventName.hackVideoViewed,
                                fromCategory: categoryTitle,
                                id: item.id,
                                hackTitle: item.title,
                                videoUrl: item.videoUrl,
                              },
                            });
                            navigation.navigate('HackVideo', {
                              videoString: item.videoUrl as string,
                            });
                          } else {
                            sendAnalyticsEvent({
                              event: mixpanelEventName.actionClicked,
                              properties: {
                                location: newCurrentRoute,
                                action: mixpanelEventName.hackDetailViewed,
                                fromCategory: categoryTitle,
                                id: item.id,
                                hackTitle: item.title,
                              },
                            });
                            navigation.navigate('HackDetail', { categoryId: id, id: item.id });
                          }
                        }}
                        style={tw.style(
                          'my-4 items-center rounded-[10px] border border-radish',
                        )}
                      >
                        {item.thumbnailImage.length > 0 && (
                          <Image
                            source={bundledSource(
                              item.thumbnailImage[0].url,
                              env.useBundledContent,
                            )}
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
                          <RenderHTML
                            source={{
                              html: frameworkDeepLink(
                                item.shortDescription || '',
                              ),
                            }}
                            contentWidth={225}
                            tagsStyles={tagStyles}
                            defaultViewProps={{
                              style: tw`m-0 shrink p-0`,
                            }}
                            defaultTextProps={{
                              style: tw.style(
                                bodySmallRegular,
                                'pt-2 text-center text-midgray',
                              ),
                            }}
                          />
                          <View
                            style={tw.style('mt-4 flex-row items-center gap-2')}
                          >
                            <HackFavorite id={item.id} dark />
                            {item.videoUrl ? (
                              <View
                                style={tw.style(
                                  'flex-row items-center justify-center rounded-[11px] bg-mint px-4 py-1',
                                )}
                              >
                                <Feather name="play" color="black" size={16} />
                                <Text
                                  style={[
                                    tw.style(subheadMediumUppercase, 'ml-1.5'),
                                  ]}
                                >
                                  Watch the video
                                </Text>
                              </View>
                            ) : (
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
                            )}
                          </View>
                        </View>
                      </DebouncedPressable>
                    </View>
                  );
                })
              )}
            </View>
          </View>
        </View>
      </ScrollView>
      <FocusAwareStatusBar statusBarStyle="light" />
    </View>
  );
}
