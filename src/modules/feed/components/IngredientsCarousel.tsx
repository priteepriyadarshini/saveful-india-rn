import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLinkTo, useNavigation } from '@react-navigation/native';
import useAnalytics from '../../analytics/hooks/useAnalytics';
import { 
    GenericCarouselWrapper, 
    GenericCarouselFlatlist 
} from '../../../common/components/GenericCarousel';
import SkeletonLoader from '../../../common/components/SkeletonLoader';
import tw from '../../../common/tailwind';
import { cardDrop } from '../../../theme/shadow';
import { subheadMediumUppercase, h7TextStyle } from '../../../theme/typography';
import { mixpanelEventName } from '../../analytics/analytics';
import useEnvironment from '../../environment/hooks/useEnvironment';
import { bgTheme } from '../utils/ingredientTheme';
import { useGetUserOnboardingQuery } from '../../../modules/intro/api/api';
import { useCurentRoute } from '../../route/context/CurrentRouteContext';
import { FeedStackScreenProps } from '../navigation/FeedNavigation';
import { useGetAllIngredientsQuery } from '../../ingredients/api/ingredientsApi';
import { useGetCurrentUserQuery } from '../../auth/api';
import { Ingredient } from '../../ingredients/api/types';
import { isCurrentlyInSeason } from '../../ingredients/helpers/ingredientTransformers';
import { skipToken } from '@reduxjs/toolkit/query/react';

interface RenderItemProps {
  _id: string;
  name: string;
  heroImageUrl?: string;
  theme?: string;
}

const itemLength = 160;

function IngredientCard({
  _id,
  name,
  heroImageUrl,
  theme,
}: RenderItemProps) {
  const env = useEnvironment();
  const { sendAnalyticsEvent } = useAnalytics();
  const { newCurrentRoute } = useCurentRoute();

  const navigation = useNavigation<FeedStackScreenProps<'FeedHome'>['navigation']>();

  const onIngredientTapped = React.useCallback(() => {
    sendAnalyticsEvent({
      event: mixpanelEventName.actionClicked,
      properties: {
        location: newCurrentRoute,
        action: mixpanelEventName.ingredientOpened,
        id: _id,
        title: name,
      },
    });

    navigation.navigate('Ingredients', {
      screen: 'IngredientDetail',
      params: { id: _id },
    });
  }, [_id, name, navigation, sendAnalyticsEvent, newCurrentRoute]);

  const ingredientTheme = theme ? String(theme).toLowerCase() : null;

  return (
    <Pressable style={tw`mr-3`} onPress={onIngredientTapped}>
      <View
        style={[
          tw`mb-3 rounded-full border border-strokecream ${bgTheme(
            ingredientTheme,
          )} p-3`,
          cardDrop,
        ]}
      >
        <Image
          style={[tw`h-[124px] w-[124px] overflow-hidden rounded`]}
          resizeMode="contain"
          source={
            heroImageUrl
              ? { uri: heroImageUrl }
              : require('../../../../assets/ingredients/placeholder.png')
          }
          accessibilityIgnoresInvertColors
        />
      </View>

      <Text
        style={tw.style(subheadMediumUppercase, 'text-center text-midgray')}
      >
        {name}
      </Text>
    </Pressable>
  );
}

export default function IngredientsCarousel() {
  const flatListRef = React.useRef<any>(null);

  const { data: currentUser, isLoading: isCurrentUserLoading } = useGetCurrentUserQuery();
  const { data: userOnboarding } = useGetUserOnboardingQuery();
  // Prefer user profile country; fall back to onboarding suburb (which stores country name).
  const userCountry = currentUser?.country || userOnboarding?.suburb;
  // Use skipToken while the user profile is loading to avoid an initial unfiltered fetch.
  const { data: apiIngredients, isLoading: isApiLoading } = useGetAllIngredientsQuery(
    !isCurrentUserLoading ? userCountry : skipToken,
  );
  const [ingredients, setIngredients] = React.useState<Ingredient[]>([]);

  useEffect(() => {
    if (apiIngredients) {
      const filteredData = apiIngredients
        .filter(ingredient => {
          // Only show ingredients with hasPage enabled and currently in season
          const hasPage = ingredient.hasPage;
          const inSeason = isCurrentlyInSeason(ingredient.inSeason || null);
          return hasPage && inSeason;
        })
        .filter(ingredient => !(userOnboarding?.allergies?.some(allergyId => allergyId === ingredient._id)))
        .sort((a, b) => {
          // Sort by order first, then by name
          const orderA = a.order ?? 999;
          const orderB = b.order ?? 999;
          
          if (orderA !== orderB) {
            return orderA - orderB;
          }
          return a.name.localeCompare(b.name);
        });
      
      setIngredients(filteredData);
    }
  }, [apiIngredients, userOnboarding]);

  const skeletonStyles = [
    'mb-3 h-[148px] w-[148px] overflow-hidden rounded-full',
    'mx-auto h-3.5 w-[124px]',
  ];

  return (
    <View style={tw.style('bg-creme pb-12 pt-6')}>
      <Text
        style={tw.style(h7TextStyle, 'mx-5 text-center')}
        maxFontSizeMultiplier={1}
      >
        Turn in-season fruit & veg into something delicious
      </Text>

      <GenericCarouselWrapper style={tw.style(`relative mt-7 overflow-hidden`)}>
        {isApiLoading ? (
          <View style={tw`flex-row pl-5 pr-2`}>
            {Array.from(Array(3).keys()).map((_, index) => (
              <View style={tw`mr-3`} key={index}>
                <SkeletonLoader styles={skeletonStyles} />
              </View>
            ))}
          </View>
        ) : (
          <GenericCarouselFlatlist
            flatListRef={flatListRef}
            contentContainerStyle={tw`pl-5 pr-2`}
            data={ingredients}
            keyExtractor={(item: Ingredient) => item._id}
            renderItem={({ item }) => <IngredientCard {...item} />}
            itemLength={itemLength}
            section={'Ingredient'}
          />
        )}
      </GenericCarouselWrapper>
      <LinearGradient
        colors={['#F3E9DA00', '#F3E9DA']}
        start={[0, 0]}
        end={[0, 1]}
        style={tw`absolute bottom-0 left-0 right-0 h-8`}
      />
    </View>
  );
}