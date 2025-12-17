import { Feather } from '@expo/vector-icons';
import { useLinkTo, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import FocusAwareStatusBar from '../../../common/components/FocusAwareStatusBar';
import { filterAllergiesByUserPreferences } from '../../../common/helpers/filterIngredients';
import { bundledSource } from '../../../common/helpers/uriHelpers';
import useContent from '../../../common/hooks/useContent';
import tw from '../../../common/tailwind';
import { IArticleContent, IFramework, IVideoContent } from '../../../models/craft';
import { mixpanelEventName } from '../../../modules/analytics/analytics';
import useAnalytics from '../../../modules/analytics/hooks/useAnalytics';
import useEnvironment from '../../../modules/environment/hooks/useEnvironment';
import HackFavorite from '../../../modules/hack/components/HackFavorite';
import { HackStackParamList } from '../../../modules/hack/navigation/HackNavigation';
import { useGetUserOnboardingQuery } from '../../../modules/intro/api/api';
import MealCard from '../../../modules/make/components/MealCard';
import { useCurentRoute } from '../../../modules/route/context/CurrentRouteContext';
import {
  useGetFavouritesQuery,
  useGetUserMealsQuery,
} from '../../../modules/track/api/api';
import AnimatedProfileHeader from '../../../modules/track/components/AnimatedProfileHeader';
import { TrackStackScreenProps } from '../../../modules/track/navigation/TrackNavigation';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import RenderHTML from 'react-native-render-html';
import {
  bodySmallRegular,
  h6TextStyle,
  h7TextStyle,
  subheadMediumUppercase,
  tagStyles,
} from '../../../theme/typography';

export default function ProfileHistoryScreen({
  route: {
    params: { id: type },
  },
}: TrackStackScreenProps<'ProfileHistory'>) {
  const offset = useRef(new Animated.Value(0)).current;

  const env = useEnvironment();

  const { data: cookedMeals } = useGetUserMealsQuery();
  const { data: savedMeals } = useGetFavouritesQuery();

  const { getFrameworks, getArticleContents, getVideoContents } = useContent();
  const { data: userOnboarding } = useGetUserOnboardingQuery();
  const [frameworks, setFrameworks] = React.useState<IFramework[]>([]);
  const [articles, setArticles] = React.useState<IArticleContent[]>([]);
  const [videos, setVideos] = React.useState<IVideoContent[]>([]);
  const [mealType] = React.useState<string>(type);

  const linkTo = useLinkTo();
  const navigation =
    useNavigation<NativeStackNavigationProp<HackStackParamList>>();

  const { sendScrollEventInitiation, sendAnalyticsEvent } = useAnalytics();
  const { newCurrentRoute } = useCurentRoute();

  const getFrameworksData = async () => {
    const data = await getFrameworks();

    if (data) {
      setFrameworks(
        filterAllergiesByUserPreferences(data, userOnboarding?.allergies),
      );
    }
  };

  const getArticlesData = async () => {
    const data = await getArticleContents();

    if (data) {
      setArticles(data);
    }
  };

  const getVideosData = async () => {
    const data = await getVideoContents();

    if (data) {
      setVideos(data);
    }
  };

  useEffect(() => {
    getFrameworksData();
    getArticlesData();
    getVideosData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (frameworks.length === 0) {
    return null;
  }

  const hackFavorites = [...articles, ...videos];

  const carouselItems =
    mealType === 'Hacks'
      ? hackFavorites.filter(article => {
          if (mealType === 'Hacks') {
            return savedMeals?.some(
              hack => hack.type === 'hack' && hack.framework_id === article.id,
            );
          } else {
            return true;
          }
        })
      : (frameworks.filter(framework => {
          if (mealType === 'Cooked') {
            return cookedMeals?.some(
              meal => meal.framework_id === framework.id,
            );
          } else if (mealType === 'Saved') {
            return savedMeals?.some(
              meal => `${meal.framework_id}` === framework.id,
            );
          } else {
            return true;
          }
        }) as any);

  return (
    <View style={tw`flex-1 bg-creme`}>
      <AnimatedProfileHeader
        type="history"
        animatedValue={offset}
        title={type}
      />
      <ScrollView
        scrollEventThrottle={1}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: offset } } }],
          {
            useNativeDriver: false,
            listener: (event: NativeSyntheticEvent<NativeScrollEvent>) =>
              sendScrollEventInitiation(
                event,
                'Profile History Page Interacted',
              ),
          },
        )}
      >
        {mealType === 'Hacks' ? (
          <View style={tw`px-5`}>
            {carouselItems.map((item: any) => {
              return (
                <View key={item.id}>
                  <View
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
                    <Pressable
                      onPress={() => {
                        if (item.videoUrl) {
                          sendAnalyticsEvent({
                            event: mixpanelEventName.actionClicked,
                            properties: {
                              location: newCurrentRoute,
                              action: mixpanelEventName.hackVideoViewed,
                              fromCategory: 'Hacks Favorite',
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
                              fromCategory: 'Hacks Favorite',
                              id: item.id,
                              hackTitle: item.title,
                            },
                          });
                          linkTo(`/hacks/1/articles/${item.id}`);
                        }
                      }}
                      style={tw.style(
                        'w-full items-center rounded-b-[10px] border-t border-radish bg-white p-6',
                      )}
                    >
                      <Text style={tw.style(h7TextStyle, 'text-center')}>
                        {item.title}
                      </Text>
                      <RenderHTML
                        source={{
                          html: item.shortDescription || '',
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
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View>
            {carouselItems.length > 0 ? (
              <View style={tw`gap-2 p-5`}>
                {carouselItems &&
                  carouselItems.map((item: any) => {
                    return (
                      <MealCard
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        heroImage={item.heroImage}
                        variantTags={item.variantTags}
                      />
                    );
                  })}
              </View>
            ) : (
              <View style={tw`gap-2 p-5`}>
                <Text
                  style={tw.style(h6TextStyle, 'text-center')}
                >{`You haven't ${type} any meals yet.`}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <FocusAwareStatusBar statusBarStyle="dark" />
    </View>
  );
}
