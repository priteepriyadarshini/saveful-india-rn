import FocusAwareStatusBar from '../../../common/components/FocusAwareStatusBar';
import SkeletonLoader from '../../../common/components/SkeletonLoader';
import tw from '../../../common/tailwind';
import { IIngredient } from '../../../models/craft';
import { mixpanelEventName } from '../../../modules/analytics/analytics';
import useAnalytics from '../../../modules/analytics/hooks/useAnalytics';
import IngredientsFooter from '../../../modules/ingredients/components/IngredientsFooter';
import IngredientsList from '../../../modules/ingredients/components/IngredientsList';
import IngredientsSearchBarHeader from '../../../modules/ingredients/components/IngredientsSearchBarHeader';
import { IngredientsStackScreenProps } from '../../../modules/ingredients/navigation/IngredientsNavigator';
import { useGetUserOnboardingQuery } from '../../../modules/intro/api/api';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  View,
} from 'react-native';
import { useGetAllIngredientsQuery } from '../api/ingredientsApi';
import { useGetCurrentUserQuery } from '../../auth/api';
import { transformIngredientsToLegacyFormat } from '../helpers/ingredientTransformers';
import { skipToken } from '@reduxjs/toolkit/query/react';

const windowWidth = Dimensions.get('window').width;
const itemLength = windowWidth - 40;

export default function IngredientsScreen({
  navigation,
}: IngredientsStackScreenProps<'IngredientsHome'>) {
  const offset = useRef(new Animated.Value(0)).current;
  const [selectedIngredients, setSelectedIngredients] = React.useState<string[]>([]);

  // Stable callback — functional setState so it never closes over the stale array,
  // meaning IngredientsList and its memoised rows don't re-render just because this ref changed.
  const onValueChecked = useCallback((value: string) => {
    setSelectedIngredients(prev => {
      const idx = prev.findIndex(x => x === value);
      if (idx === -1) return [...prev, value];
      const updated = [...prev];
      updated.splice(idx, 1);
      return updated;
    });
  }, []);

  const { data: userOnboarding } = useGetUserOnboardingQuery();
  
  const { data: currentUser, isLoading: isCurrentUserLoading } = useGetCurrentUserQuery();

  // Derive country: prefer user profile field, fall back to onboarding suburb (stores country name).
  // Use skipToken while the user profile is still loading to avoid fetching all ingredients
  // unfiltered during the brief window before currentUser resolves.
  const userCountry = currentUser?.country || userOnboarding?.suburb;
  const { data: apiIngredients, isLoading: isIngredientsLoading } = useGetAllIngredientsQuery(
    !isCurrentUserLoading ? userCountry : skipToken,
  );
  const isApiLoading = isCurrentUserLoading || isIngredientsLoading;
  
  // Derive ingredient list synchronously — no extra state/useEffect double-render
  const ingredients = useMemo(
    () => apiIngredients ? transformIngredientsToLegacyFormat(apiIngredients) : [],
    [apiIngredients],
  );

  const [searchInput, setSearchInput] = React.useState<string>('');

  // Memoised — only recomputes when the list or search text actually changes
  const filteredData = useMemo(() => {
    const lower = searchInput.toLowerCase();
    return ingredients.filter(item =>
      selectedIngredients.includes(item.id) ||
      item.title.toLowerCase().includes(lower),
    );
  }, [ingredients, searchInput, selectedIngredients]);

  // Memoised footer selection — avoids O(n) filter on every render
  const selectedIngredientObjects = useMemo(
    () => ingredients.filter(x => selectedIngredients.includes(x.id)),
    [ingredients, selectedIngredients],
  );

  const skeletonStyles = [`w-[${itemLength}px] h-8 my-2`];

  // Record what people are searching for - when no results are found
  const { sendAnalyticsEvent } = useAnalytics();
  useEffect(() => {
    if (searchInput !== '' && filteredData.length === 0) {
      sendAnalyticsEvent({
        event: mixpanelEventName.ingredientSearchNoResults,
        properties: {
          search: searchInput,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredData, searchInput]);

  return (
    <View style={tw`flex-1 bg-[#FFF5E7]`}>
      <IngredientsSearchBarHeader
        animatedValue={offset}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
      />
      <View style={tw`flex-1`}>
        {isApiLoading ? (
          <View style={tw`items-center pt-4`}>
            {Array.from(Array(20).keys()).map((_, index) => (
              <View key={index}>
                <SkeletonLoader styles={skeletonStyles} />
              </View>
            ))}
          </View>
        ) : (
          <View style={tw`flex-1 items-center justify-start`}>
            <IngredientsList
              offset={offset}
              data={filteredData}
              selectedIngredients={selectedIngredients}
              setSelectedIngredients={onValueChecked}
            />
          </View>
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <IngredientsFooter
          selectedIngredients={selectedIngredientObjects}
          onValueChecked={onValueChecked}
          navigation={navigation}
        />
      </KeyboardAvoidingView>
      <FocusAwareStatusBar statusBarStyle="dark" />
    </View>
  );
}
