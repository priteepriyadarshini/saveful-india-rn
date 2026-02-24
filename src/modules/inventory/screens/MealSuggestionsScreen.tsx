import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  ImageBackground,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import tw from '../../../common/tailwind';
import { useNavigation } from '@react-navigation/native';
import {
  bodyMediumRegular,
  bodyMediumBold,
  h6TextStyle,
} from '../../../theme/typography';
import {
  useGetMealSuggestionsQuickQuery,
  useGetInventoryGroupedQuery,
} from '../api/inventoryApi';
import MealCard from '../../make/components/MealCard';
import { InventoryStackScreenProps } from '../navigation/InventoryNavigator';
import { MealSuggestion } from '../api/types';

function getMatchColor(pct: number): string {
  if (pct >= 80) return '#22C55E';
  if (pct >= 60) return '#F59E0B';
  return '#3B82F6';
}

function getInsightText(suggestion: {
  aiReason?: string;
  matchedIngredients?: string[];
  missingIngredients?: string[];
  expiringIngredientsUsed?: string[];
}) {
  if (suggestion.aiReason?.trim()) {
    return suggestion.aiReason.trim();
  }

  const matchedCount = (suggestion.matchedIngredients || []).length;
  const missingCount = (suggestion.missingIngredients || []).length;
  const expiringUsed = suggestion.expiringIngredientsUsed || [];

  if (expiringUsed.length > 0) {
    const firstExpiring = expiringUsed[0];
    return `Great for reducing waste — this recipe helps use ${firstExpiring}${
      expiringUsed.length > 1
        ? ' and other expiring items'
        : ''
    }.`;
  }

  if (matchedCount > 0 && missingCount === 0) {
    return `You already have everything needed for this recipe in your kitchen.`;
  }

  if (matchedCount > 0) {
    return `You already have ${matchedCount} ingredient${
      matchedCount > 1 ? 's' : ''
    } for this recipe, so it needs only a small top-up.`;
  }

  return 'A flexible pick based on your pantry, fridge, and freezer items.';
}

export default function MealSuggestionsScreen({
  route,
}: InventoryStackScreenProps<'InventoryMealSuggestions'>) {
  const navigation = useNavigation();
  const [maxHeight, setMaxHeight] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [selectedIngredientId, setSelectedIngredientId] = useState<
    string | undefined
  >();

  const country = route.params?.country;

  const queryParams = useMemo(() => {
    const params: { country?: string; ingredientId?: string } = {};
    if (country) params.country = country;
    if (selectedIngredientId) params.ingredientId = selectedIngredientId;
    return Object.keys(params).length > 0 ? params : undefined;
  }, [country, selectedIngredientId]);

  const {
    data: suggestions,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useGetMealSuggestionsQuickQuery(queryParams);

  const { data: inventoryGrouped } = useGetInventoryGroupedQuery();

  const inventoryIngredients = useMemo(() => {
    if (!inventoryGrouped) return [];
    const all = [
      ...(inventoryGrouped.pantry || []),
      ...(inventoryGrouped.fridge || []),
      ...(inventoryGrouped.freezer || []),
      ...(inventoryGrouped.other || []),
    ];
    const seen = new Set();
    return all
      .filter((item) => {
        const ingId =
          typeof item.ingredientId === 'object'
            ? (item.ingredientId as any)?._id
            : item.ingredientId;
        if (!ingId || seen.has(ingId)) return false;
        seen.add(ingId);
        return true;
      })
      .map((item) => ({
        id:
          typeof item.ingredientId === 'object'
            ? (item.ingredientId as any)?._id
            : item.ingredientId,
        name: item.name,
      }));
  }, [inventoryGrouped]);

  const filteredIngredients = useMemo(() => {
    if (searchText.length < 1) return [];
    const lower = searchText.toLowerCase();
    return inventoryIngredients.filter((i) =>
      i.name.toLowerCase().includes(lower),
    );
  }, [searchText, inventoryIngredients]);

  const displaySuggestions = useMemo(() => {
    if (!suggestions) return [];
    if (!searchText.trim() || selectedIngredientId) return suggestions;
    const lower = searchText.toLowerCase();
    return suggestions.filter(
      (s: MealSuggestion) =>
        s.recipe?.title?.toLowerCase().includes(lower) ||
        (s.matchedIngredients || []).some((ing) =>
          ing.toLowerCase().includes(lower),
        ),
    );
  }, [suggestions, searchText, selectedIngredientId]);

  const handleSelectIngredient = useCallback(
    (id: string, name: string) => {
      setSelectedIngredientId(id);
      setSearchText(name);
    },
    [],
  );

  const handleClearSearch = useCallback(() => {
    setSearchText('');
    setSelectedIngredientId(undefined);
  }, []);

  return (
    <SafeAreaView style={tw`flex-1`} edges={['top']}>
      <ImageBackground
        style={tw`flex-1`}
        source={require('../../../../assets/ribbons/lemon.png')}
        imageStyle={{ resizeMode: 'cover' }}
      >
      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={tw`pb-10`}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={tw`flex-row items-center px-4 pt-4 pb-2`}>
          <Pressable onPress={() => navigation.goBack()} style={tw`mr-3`}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </Pressable>
          <View style={tw`flex-1`}>
            <Text style={tw.style(h6TextStyle, 'text-gray-900 uppercase')}>
              What Can I Cook?
            </Text>
            <Text style={tw.style(bodyMediumRegular, 'text-gray-500 text-xs mt-0.5')}>
              Recipes matched to your kitchen inventory
            </Text>
          </View>
          {isFetching && !isLoading && (
            <ActivityIndicator size="small" color="#6B21A8" />
          )}
        </View>

        {/* Search */}
        <View style={tw`px-4 mt-2`}>
          <View
            style={tw`flex-row items-center bg-gray-50 rounded-xl px-3 h-12 border border-gray-200`}
          >
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              style={[tw.style(bodyMediumRegular, 'flex-1 ml-2 text-gray-900'), { fontSize: 14 }]}
              placeholder="Search by ingredient or recipe name..."
              placeholderTextColor="#9CA3AF"
              value={searchText}
              onChangeText={(text) => {
                setSearchText(text);
                if (selectedIngredientId) {
                  setSelectedIngredientId(undefined);
                }
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchText.length > 0 && (
              <Pressable onPress={handleClearSearch}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </Pressable>
            )}
          </View>

          {/* Search Dropdown */}
          {filteredIngredients.length > 0 && !selectedIngredientId && (
            <View
              style={tw`bg-white border border-gray-200 rounded-xl mt-1 overflow-hidden`}
            >
              {filteredIngredients.slice(0, 6).map((ingredient) => (
                <Pressable
                  key={ingredient.id}
                  onPress={() =>
                    handleSelectIngredient(ingredient.id, ingredient.name)
                  }
                  style={tw`px-2.5 py-1.5 border-b border-gray-100 flex-row items-center`}
                >
                  <Ionicons
                    name="restaurant-outline"
                    size={16}
                    color="#6B7280"
                  />
                  <Text style={tw.style(bodyMediumRegular, 'ml-2 text-gray-800')}>
                    {ingredient.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Active Filter Badge */}
          {selectedIngredientId && (
            <View style={tw`flex-row items-center mt-2`}>
              <View
                style={tw`bg-purple-100 rounded-full px-3 py-1 flex-row items-center`}
              >
                <Text style={tw.style(bodyMediumBold, 'text-purple-800 text-xs')}>
                  Filtered by:
                </Text>
                <Text
                  style={tw.style(bodyMediumRegular, 'text-purple-700 text-xs ml-1')}
                >
                  {searchText}
                </Text>
                <Pressable onPress={handleClearSearch} style={tw`ml-1.5`}>
                  <Ionicons name="close" size={14} color="#7E22CE" />
                </Pressable>
              </View>
            </View>
          )}

          {/* Ingredient Chips */}
          {!selectedIngredientId && inventoryIngredients.length > 0 && (
            <View style={tw`flex-row flex-wrap gap-2 mt-3`}>
              {inventoryIngredients.slice(0, 10).map((ingredient) => (
                <Pressable
                  key={ingredient.id}
                  onPress={() =>
                    handleSelectIngredient(ingredient.id, ingredient.name)
                  }
                  style={tw`bg-gray-100 rounded-full h-7 px-2.5 flex-row items-center justify-center self-start`}
                >
                  <Text style={tw.style(bodyMediumRegular, 'text-gray-700 text-xs')}>
                    {ingredient.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Content - directly below chips, no flex-1 spacer */}
        {isLoading ? (
          <View style={tw`items-center justify-center py-20`}>
            <ActivityIndicator size="large" color="#6B21A8" />
            <Text style={tw.style(bodyMediumRegular, 'text-gray-500 mt-4')}>
              Finding recipes from your ingredients...
            </Text>
          </View>
        ) : isError ? (
          <View style={tw`items-center justify-center py-20 px-4`}>
            <Ionicons name="warning-outline" size={48} color="#EF4444" />
            <Text style={tw.style(bodyMediumBold, 'text-gray-800 mt-3')}>
              Failed to get suggestions
            </Text>
            <Pressable
              onPress={() => refetch()}
              style={tw`mt-3 bg-eggplant px-6 py-2 rounded-full`}
            >
              <Text style={tw.style(bodyMediumBold, 'text-white')}>Retry</Text>
            </Pressable>
          </View>
        ) : !displaySuggestions || displaySuggestions.length === 0 ? (
          <View style={tw`items-center justify-center py-20 px-4`}>
            <Ionicons name="nutrition-outline" size={48} color="#D1D5DB" />
            <Text style={tw.style(bodyMediumBold, 'text-gray-800 mt-3 text-center')}>
              {selectedIngredientId
                ? 'No recipes found for this ingredient'
                : 'No recipe matches found'}
            </Text>
            <Text
              style={tw.style(bodyMediumRegular, 'text-gray-500 mt-1.5 text-center')}
            >
              {selectedIngredientId
                ? 'Try a different ingredient or clear the filter.'
                : 'Add more ingredients to your kitchen\nto get recipe suggestions.'}
            </Text>
            {selectedIngredientId && (
              <Pressable
                onPress={handleClearSearch}
                style={tw`mt-3 bg-eggplant px-6 py-2 rounded-full`}
              >
                <Text style={tw.style(bodyMediumBold, 'text-white')}>
                  Clear Filter
                </Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View style={tw`mt-4`}>
            {/* Section Header */}
            <View style={tw`items-center mb-3 px-4`}>
              <Text style={tw.style(h6TextStyle, 'text-gray-900 uppercase')}>
                COOK FROM YOUR KITCHEN
              </Text>
              <Text style={tw.style(bodyMediumRegular, 'text-gray-500 text-xs mt-1')}>
                {displaySuggestions.length} recipe
                {displaySuggestions.length !== 1 ? 's' : ''} matched
                {selectedIngredientId ? ` for ${searchText}` : ''}
              </Text>
            </View>

            {/* Recipe Cards */}
            {displaySuggestions.map((suggestion: MealSuggestion) => {
              const matchColor = getMatchColor(suggestion.matchPercentage ?? 0);
              const matched = suggestion.matchedIngredients || [];
              const missing = suggestion.missingIngredients || [];
              const expiringUsed = suggestion.expiringIngredientsUsed || [];
              return (
                <View key={suggestion.recipe._id} style={tw`mb-4 px-4`}>
                  <MealCard
                    id={suggestion.recipe._id}
                    heroImage={[{ url: suggestion.recipe.heroImageUrl || '' }] as any}
                    title={suggestion.recipe.title}
                    variantTags={[] as any}
                    maxHeight={maxHeight}
                    setMaxHeight={setMaxHeight}
                  />
                  <View style={tw`mt-2 px-1`}>
                    <View style={tw`flex-row items-center flex-wrap gap-1.5`}>
                      <View
                        style={[
                          tw`rounded-full px-2 py-0.5`,
                          { backgroundColor: matchColor + '20' },
                        ]}
                      >
                        <Text
                          style={[
                            tw.style(bodyMediumBold),
                            { color: matchColor, fontSize: 11 },
                          ]}
                        >
                          {suggestion.matchPercentage ?? 0}% match
                        </Text>
                      </View>
                      {expiringUsed.length > 0 && (
                        <View
                          style={tw`bg-amber-50 rounded-full px-2 py-0.5`}
                        >
                          <Text
                            style={[
                              tw.style(bodyMediumRegular, 'text-amber-700'),
                              { fontSize: 11 },
                            ]}
                          >
                            Uses expiring ingredients
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text
                      style={[tw.style(bodyMediumRegular, 'text-gray-500 mt-1'), { fontSize: 12 }]}
                    >
                      {matched.length} ingredient
                      {matched.length !== 1 ? 's' : ''}{' '}
                      you have
                      {missing.length > 0 && (
                        <Text style={tw`text-gray-400`}>
                          {' '}
                          · {missing.length} missing
                        </Text>
                      )}
                    </Text>
                    <Text
                      style={[tw.style(bodyMediumRegular, 'text-gray-400 mt-0.5'), { fontSize: 11 }]}
                    >
                      {getInsightText(suggestion)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}