import {
  GenericCarouselFlatlist,
  GenericCarouselWrapper,
} from '../../../common/components/GenericCarousel';
import Pill from '../../../common/components/Pill';
import SkeletonLoader from '../../../common/components/SkeletonLoader';
import { filterAllergiesByUserPreferences } from '../../../common/helpers/filterIngredients';
// Removed Craft CMS content; using API services only
import tw from '../../../common/tailwind';
import { IFramework } from '../../../models/craft';
import { mixpanelEventName } from '../../../modules/analytics/analytics';
import useAnalytics from '../../../modules/analytics/hooks/useAnalytics';
import MealCard from '../../../modules/feed/components/MealCard';
import { useGetUserOnboardingQuery } from '../../../modules/intro/api/api';
import { useGetCurrentUserQuery } from '../../auth/api';
import { useCurentRoute } from '../../../modules/route/context/CurrentRouteContext';
import { useGetFavouriteDetailsQuery } from '../../../modules/track/api/api';
import { useGetCookedRecipesDetailsQuery, useGetTrendingRecipesQuery } from '../../../modules/analytics/api/api';
import React, { useEffect, useState } from 'react';
import { Dimensions, ImageBackground, Text, View } from 'react-native';
import { h6TextStyle } from '../../../theme/typography';

const windowWidth = Dimensions.get('window').width;
const itemLength = windowWidth - 40;

export default function MealsCarousel() {
  const [mealType, setMealType] = useState<string>('Trending');
  const isChecked = (value: string) => {
    return mealType === value;
  };

  const { data: cookedRecipesDetails } = useGetCookedRecipesDetailsQuery();
  const cookedItems = cookedRecipesDetails?.cookedRecipes || [];
  const { data: favouriteDetails } = useGetFavouriteDetailsQuery();
  const favItems = favouriteDetails || [];
  const { data: currentUser } = useGetCurrentUserQuery();
  const { data: trendingData } = useGetTrendingRecipesQuery(currentUser?.country);
  const trendingItems = trendingData?.trending || [];
  const { data: userOnboarding } = useGetUserOnboardingQuery();

  const MEAL_TYPES = [
    {
      id: 1,
      name: 'Trending',
    },
    // Only add cooked option if user has cooked meals
    ...(cookedItems?.length
      ? [
          {
            id: 2,
            name: 'Cooked',
          },
        ]
      : []),
    // Only add saved option if user has saved meals
    ...(favItems?.some(i => i.type === 'framework')
      ? [
          {
            id: 3,
            name: 'Saved',
          },
        ]
      : []),
  ];

  const [, updateState] = React.useState<unknown>();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  const { sendAnalyticsEvent } = useAnalytics();
  const { newCurrentRoute } = useCurentRoute();

  const [maxHeight, setMaxHeight] = useState<number>(0);

  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const flatListRef = React.useRef<any>(null); // Reference to the FlatList component

  // Function to scroll the FlatList
  const scrollCarousel = (offset: number) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset, animated: true });
    }
  };

  useEffect(() => {
    // Loading state based on API data readiness
    setIsLoading(false);
  }, [cookedItems, favItems, trendingItems]);

  const carouselItems =
    mealType === 'Cooked'
      ? cookedItems.map(ci => ({
          id: ci.id,
          title: ci.title,
          heroImage: [{ url: ci.heroImageUrl || '' }] as any,
          variantTags: [] as any,
        }))
      : mealType === 'Saved'
      ? favItems
          .filter(i => i.type === 'framework')
          .map(fr => ({
            id: fr.id,
            title: fr.title,
            heroImage: [{ url: fr.heroImageUrl || '' }] as any,
            variantTags: [] as any,
          }))
      : trendingItems.map(t => ({
          id: t.id,
          title: t.title,
          heroImage: [{ url: t.heroImageUrl || '' }] as any,
          variantTags: [] as any,
        }));

  const skeletonStyles = [
    `mb-3 h-[311px] w-[${itemLength}px] overflow-hidden rounded`,
  ];

  return (
    <ImageBackground
      style={tw`w-full items-center py-10`}
      source={require('../../../../assets/ribbons/lemon.png')}
    >
      <Text
        style={tw.style(h6TextStyle, 'mb-5 px-5 text-center')}
        maxFontSizeMultiplier={1}
      >
        MAXIMUM-FLAVOUR, MINIMAL-WASTE meals
      </Text>
      {isLoading ? (
        <View style={tw`flex-row pl-5`}>
          {Array.from(Array(3).keys()).map((_, index) => (
            <View style={tw`mr-3`} key={index}>
              <SkeletonLoader styles={skeletonStyles} />
            </View>
          ))}
        </View>
      ) : (
        <>
          <View style={tw`mb-3 flex-row flex-wrap justify-center gap-1`}>
            {MEAL_TYPES.map((item, index) => (
              <Pill
                key={index}
                text={item.name}
                size="small"
                kind="vibrant"
                isActive={isChecked(item.name)}
                setIsActive={() => {
                  sendAnalyticsEvent({
                    event: mixpanelEventName.actionClicked,
                    properties: {
                      location: newCurrentRoute,
                      item: item.name,
                      action: 'Meal Tab Filtered',
                    },
                  });
                  scrollCarousel(0);
                  setMealType(item.name);
                  forceUpdate();
                }}
              />
            ))}
          </View>
          <GenericCarouselWrapper style={tw`relative overflow-hidden pb-5`}>
            <GenericCarouselFlatlist
              flatListRef={flatListRef}
              contentContainerStyle={tw`pl-5 pr-3`}
              data={carouselItems}
              itemLength={itemLength + 8}
              renderItem={(renderItem: { item: IFramework; index: number }) => (
                <View style={tw.style(`w-[${itemLength}px] mr-2`)}>
                  <MealCard
                    {...renderItem.item}
                    maxHeight={maxHeight}
                    setMaxHeight={setMaxHeight}
                  />
                </View>
              )}
              section={'Meals'}
              snapToAlignment="start"
            />
          </GenericCarouselWrapper>
        </>
      )}
    </ImageBackground>
  );
}
