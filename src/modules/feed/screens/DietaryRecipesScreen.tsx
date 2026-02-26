/**
 * DietaryRecipesScreen
 * Shows recipes filtered by the user's active dietary preferences.
 * Receives `filters` (array of dietary tag keys) and `title` from navigation params.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { skipToken } from '@reduxjs/toolkit/query/react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import tw from '../../../common/tailwind';
import MealCard from '../components/MealCard';
import FocusAwareStatusBar from '../../../common/components/FocusAwareStatusBar';
import {
  useGetDietaryRecommendationsQuery,
} from '../../recipe/api/recipeApi';
import { useGetCurrentUserQuery } from '../../auth/api';
import { useGetUserOnboardingQuery } from '../../intro/api/api';
import { FeedStackParamList } from '../navigation/FeedNavigation';
import { h6TextStyle, bodySmallRegular, subheadMediumUppercase, subheadSmallUppercase } from '../../../theme/typography';

// ─── Dietary tag config (icons, no emojis) ─────────────────────────────────

interface TagConfig {
  key: string;
  label: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
}

function makeTag(key: string, label: string, iconName: string, lib: 'ion' | 'mci' = 'ion'): TagConfig {
  const stone = '#9E9E9E';
  const white = '#FFFFFF';
  return {
    key,
    label,
    icon:       lib === 'mci'
      ? <MaterialCommunityIcons name={iconName as any} size={12} color={stone} />
      : <Ionicons name={iconName as any} size={12} color={stone} />,
    activeIcon: lib === 'mci'
      ? <MaterialCommunityIcons name={iconName as any} size={12} color={white} />
      : <Ionicons name={iconName as any} size={12} color={white} />,
  };
}

const DIETARY_TAGS: TagConfig[] = [
  makeTag('vegan',       'Vegan',             'leaf-outline'),
  makeTag('vegetarian',  'Vegetarian',        'leaf'),
  makeTag('dairyFree',   'Dairy-Free',        'water-outline'),
  makeTag('glutenFree',  'Gluten-Free',       'wheat-off',    'mci'),
  makeTag('nutFree',     'Nut-Free',          'peanut-off',   'mci'),
  makeTag('diabetes',    'Diabetic-Friendly', 'pulse-outline'),
];

/** Map dietary tag keys to API query params.
 *  Always sends boolean flags explicitly so the backend does NOT merge
 *  the stored user profile on top of the user's current UI selection. */
function buildQueryParams(filters: string[], country?: string) {
  let vegType: string | undefined;
  if (filters.includes('vegan'))           vegType = 'VEGAN';
  else if (filters.includes('vegetarian')) vegType = 'VEGETARIAN';

  return {
    vegType,
    dairyFree:   filters.includes('dairyFree'),
    nutFree:     filters.includes('nutFree'),
    glutenFree:  filters.includes('glutenFree'),
    hasDiabetes: filters.includes('diabetes'),
    country,
  };
}

// ─── Screen ────────────────────────────────────────────────────────────────

type RouteType = RouteProp<FeedStackParamList, 'DietaryRecipes'>;

export default function DietaryRecipesScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteType>();

  const initialFilters: string[] = route.params?.filters ?? [];
  const screenTitle: string = route.params?.title ?? 'For You';

  const { data: currentUser } = useGetCurrentUserQuery();
  const { data: userOnboarding } = useGetUserOnboardingQuery();
  const userCountry = currentUser?.country || userOnboarding?.suburb;

  const [selectedFilters, setSelectedFilters] = useState<string[]>(initialFilters);
  const [maxCardHeight, setMaxCardHeight] = useState<number>(0);

  const queryParams = useMemo(
    () => buildQueryParams(selectedFilters, userCountry),
    [selectedFilters, userCountry],
  );

  // Skip query entirely when no filters are active — avoids returning all recipes
  const skipQuery = selectedFilters.length === 0;
  const { data: recipes, isLoading, isFetching, refetch } = useGetDietaryRecommendationsQuery(
    skipQuery ? skipToken : queryParams,
  );

  const toggleFilter = (key: string) => {
    setSelectedFilters(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key],
    );
  };

  const activeRecipes = recipes ?? [];

  useEffect(() => {
    setMaxCardHeight(0);
  }, [selectedFilters, activeRecipes.length]);

  return (
    <View style={tw`flex-1 bg-creme`}>
      <FocusAwareStatusBar statusBarStyle="dark" />

      <SafeAreaView edges={['top']} style={tw`z-10`}>
        {/* Header */}
        <View style={tw`flex-row items-center px-4 pt-2 pb-3 gap-3`}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={tw`h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm`}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={20} color={tw.color('eggplant')} />
          </Pressable>
          <View style={tw`flex-1`}>
            <Text style={tw.style(h6TextStyle, 'text-eggplant')} numberOfLines={1}>
              {screenTitle}
            </Text>
            <Text style={tw.style(subheadSmallUppercase, 'text-stone')}>
              {isLoading || isFetching
                ? 'Loading…'
                : `${activeRecipes.length} recipe${activeRecipes.length === 1 ? '' : 's'}`}
            </Text>
          </View>
        </View>

        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={tw`px-4 pb-3 gap-2`}
        >
          {DIETARY_TAGS.map(tag => {
            const isActive = selectedFilters.includes(tag.key);
            return (
              <Pressable
                key={tag.key}
                onPress={() => toggleFilter(tag.key)}
                style={tw.style(
                  'flex-row items-center gap-1.5 rounded-full border px-3 py-1.5',
                  isActive ? 'bg-eggplant border-eggplant' : 'bg-white border-strokecream',
                )}
              >
                {isActive ? tag.activeIcon : tag.icon}
                <Text
                  style={tw.style(
                    subheadSmallUppercase,
                    isActive ? 'text-white' : 'text-stone',
                  )}
                >
                  {tag.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </SafeAreaView>

      {/* Content */}
      {isLoading ? (
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color={tw.color('eggplant')} />
          <Text style={tw.style(bodySmallRegular, 'text-stone mt-3')}>
            Finding recipes for you…
          </Text>
        </View>
      ) : skipQuery ? (
        <View style={tw`flex-1 items-center justify-center px-8`}>
          <Ionicons name="options-outline" size={48} color={tw.color('stone')} style={tw`mb-4`} />
          <Text style={tw.style(subheadMediumUppercase, 'text-eggplant text-center mb-2')}>
            Select a Filter
          </Text>
          <Text style={tw.style(bodySmallRegular, 'text-stone text-center')}>
            Tap a dietary preference above to see matching recipes.
          </Text>
        </View>
      ) : activeRecipes.length === 0 ? (
        <View style={tw`flex-1 items-center justify-center px-8`}>
          <Ionicons name="search-outline" size={48} color={tw.color('stone')} style={tw`mb-4`} />
          <Text style={tw.style(subheadMediumUppercase, 'text-eggplant text-center mb-2')}>
            No Matches Found
          </Text>
          <Text style={tw.style(bodySmallRegular, 'text-stone text-center')}>
            Try selecting different dietary filters above.
          </Text>
        </View>
      ) : (
        <FlatList
          data={activeRecipes}
          keyExtractor={item => item._id}
          numColumns={2}
          contentContainerStyle={tw`px-3 pb-8 pt-2`}
          columnWrapperStyle={tw`gap-3 mb-3`}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isFetching && !isLoading}
          renderItem={({ item }) => (
            <View style={tw`flex-1`}>
              <MealCard
                id={item._id}
                title={item.title}
                heroImage={
                  item.heroImageUrl
                    ? [{ url: item.heroImageUrl } as any]
                    : undefined
                }
                variantTags={[]}
                maxHeight={maxCardHeight}
                setMaxHeight={setMaxCardHeight}
              />
            </View>
          )}
        />
      )}
    </View>
  );
}
