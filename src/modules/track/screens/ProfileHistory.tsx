import { Feather } from '@expo/vector-icons';
import { useLinkTo, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import FocusAwareStatusBar from '../../../common/components/FocusAwareStatusBar';
import { filterAllergiesByUserPreferences } from '../../../common/helpers/filterIngredients';
// Removed Craft CMS content dependency; using API favourites details
import tw from '../../../common/tailwind';
import { IFramework } from '../../../models/craft';
import { mixpanelEventName } from '../../../modules/analytics/analytics';
import useAnalytics from '../../../modules/analytics/hooks/useAnalytics';
import useEnvironment from '../../../modules/environment/hooks/useEnvironment';
import HackFavorite from '../../../modules/hack/components/HackFavorite';
import { HackStackParamList } from '../../../modules/hack/navigation/HackNavigation';
import { useGetUserOnboardingQuery } from '../../../modules/intro/api/api';
import MealCard from '../../../modules/make/components/MealCard';
import { useCurentRoute } from '../../../modules/route/context/CurrentRouteContext';
import { useGetFavouriteDetailsQuery } from '../../../modules/track/api/api';
import { useGetCookedRecipesDetailsQuery } from '../../../modules/analytics/api/api';
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

  const { data: cookedRecipesDetails } = useGetCookedRecipesDetailsQuery();
  const cookedItems = cookedRecipesDetails?.cookedRecipes || [];

  // No longer using Craft content; relying on API
  const { data: userOnboarding } = useGetUserOnboardingQuery();
  const [frameworks, setFrameworks] = React.useState<IFramework[]>([]);
  const [mealType] = React.useState<string>(type);

  const linkTo = useLinkTo();
  const navigation =
    useNavigation<NativeStackNavigationProp<HackStackParamList>>();

  const { sendScrollEventInitiation, sendAnalyticsEvent } = useAnalytics();
  const { newCurrentRoute } = useCurentRoute();

  // Frameworks for fallback only (if needed); otherwise use favourites details

  useEffect(() => {
    // Optionally load frameworks if needed elsewhere
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render regardless of frameworks; using API data for cooked/saved/hacks

  const { data: favouriteDetails } = useGetFavouriteDetailsQuery();
  const favItems = favouriteDetails || [];

  const carouselItems =
    mealType === 'Cooked'
      ? cookedItems.map(ci => ({
          id: ci.id,
          title: ci.title,
          heroImageUrl: ci.heroImageUrl,
        }))
      : mealType === 'Hacks'
      ? favItems.filter(item => item.type === 'hack')
      : favItems.filter(item => item.type === 'framework');

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
            {carouselItems.length > 0 ? (
              carouselItems.map((item: any) => {
                return (
                  <View key={item.id}>
                    <View
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
                          // Navigate to Hack detail using API id
                          navigation.navigate('HackDetail', { id: item.id });
                        }
                      }}
                      style={tw.style(
                        'w-full items-center rounded-b-[10px] border-t border-radish bg-white p-6',
                      )}
                    >
                      <Text style={tw.style(h7TextStyle, 'text-center')}>
                        {item.title}
                      </Text>
                      {item.shortDescription ? (
                        <Text style={tw.style(bodySmallRegular, 'pt-2 text-center text-midgray')}>
                          {item.shortDescription}
                        </Text>
                      ) : null}
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
            })
            ) : (
              <View style={tw`my-4`}>
                <View 
                  style={tw.style(
                    'w-full items-center gap-3 rounded-[10px] border border-radish bg-white p-6 min-h-[150px] justify-center'
                  )}
                >
                  <Text
                    style={tw.style(h6TextStyle, 'text-center text-midgray')}
                  >
                    No hacks saved yet
                  </Text>
                  <Text
                    style={tw.style(bodySmallRegular, 'text-center text-midgray px-4')}
                  >
                    Save helpful hacks and tips to reference them anytime!
                  </Text>
                </View>
              </View>
            )}
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
                        heroImage={[{ url: item.heroImageUrl || '' }] as any}
                        variantTags={[] as any}
                      />
                    );
                  })}
              </View>
            ) : (
              <View style={tw`gap-2 p-5`}>
                <View 
                  style={tw.style(
                    'w-full items-center gap-3 rounded border border-strokecream bg-white p-6 min-h-[150px] justify-center'
                  )}
                >
                  <Text
                    style={tw.style(h6TextStyle, 'text-center text-midgray')}
                  >
                    {mealType === 'Cooked' 
                      ? "No meals cooked yet" 
                      : mealType === 'Saved'
                      ? "No meals saved yet"
                      : "No hacks saved yet"}
                  </Text>
                  <Text
                    style={tw.style(bodySmallRegular, 'text-center text-midgray px-4')}
                  >
                    {mealType === 'Cooked' 
                      ? "Start cooking delicious meals and they'll appear here!" 
                      : mealType === 'Saved'
                      ? "Save your favorite meals to find them easily later!"
                      : "Save helpful hacks and tips to reference them anytime!"}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <FocusAwareStatusBar statusBarStyle="dark" />
    </View>
  );
}
