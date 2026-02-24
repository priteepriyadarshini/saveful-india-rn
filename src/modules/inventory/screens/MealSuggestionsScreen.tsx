import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import tw from '../../../common/tailwind';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  bodyMediumRegular,
  bodyMediumBold,
  h6TextStyle,
} from '../../../theme/typography';
import { useGetMealSuggestionsQuery } from '../api/inventoryApi';
import { MealSuggestion } from '../api/types';
import type { InitialStackParamList } from '../../navigation/navigator/InitialNavigator';

export default function MealSuggestionsScreen() {
  const navigation = useNavigation<any>();
  const {
    data: suggestions,
    isLoading,
    isError,
    refetch,
  } = useGetMealSuggestionsQuery();

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
      {/* Header */}
      <View style={tw`px-5 pt-3 pb-2 flex-row items-center`}>
        <Pressable onPress={() => navigation.goBack()} style={tw`mr-3`}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </Pressable>
        <View style={tw`flex-1`}>
          <Text style={tw.style(h6TextStyle, 'text-gray-900')}>
            What Can I Cook?
          </Text>
          <Text style={tw.style(bodyMediumRegular, 'text-gray-500 text-xs')}>
            Recipes matched to your kitchen inventory
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color="#EA580C" />
          <Text style={tw.style(bodyMediumRegular, 'text-gray-500 mt-3')}>
            Finding recipes from your ingredients...
          </Text>
        </View>
      ) : isError ? (
        <View style={tw`flex-1 items-center justify-center px-5`}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={tw.style(bodyMediumRegular, 'text-red-500 mt-2')}>
            Failed to get suggestions
          </Text>
          <Pressable
            onPress={() => refetch()}
            style={tw`mt-3 bg-orange-600 px-6 py-2 rounded-full`}
          >
            <Text style={tw.style(bodyMediumBold, 'text-white')}>Retry</Text>
          </Pressable>
        </View>
      ) : !suggestions || suggestions.length === 0 ? (
        <View style={tw`flex-1 items-center justify-center px-5`}>
          <Ionicons name="restaurant-outline" size={64} color="#D1D5DB" />
          <Text style={tw.style(bodyMediumBold, 'text-gray-400 mt-3')}>
            No recipe matches found
          </Text>
          <Text style={tw.style(bodyMediumRegular, 'text-gray-400 mt-1 text-center')}>
            Add more ingredients to your kitchen{'\n'}to get recipe suggestions.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={tw`flex-1`}
          contentContainerStyle={tw`px-5 pb-10 pt-2 gap-3`}
        >
          {suggestions.map((suggestion, index) => (
            <SuggestionCard
              key={suggestion.recipe._id}
              suggestion={suggestion}
              rank={index + 1}
              navigation={navigation}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function SuggestionCard({
  suggestion,
  rank,
  navigation,
}: {
  suggestion: MealSuggestion;
  rank: number;
  navigation: NativeStackNavigationProp<InitialStackParamList, any>;
}) {
  const matchColor =
    suggestion.matchPercentage >= 80
      ? '#22C55E'
      : suggestion.matchPercentage >= 60
        ? '#F59E0B'
        : '#3B82F6';

  const goToRecipe = () => {
    const slug = suggestion.recipe.title.toLowerCase().replace(/\s+/g, '-');
    navigation.navigate('Root', {
      screen: 'Make',
      params: {
        screen: 'PrepDetail',
        params: { slug },
      },
    } as any);
  };

  return (
    <Pressable
      onPress={goToRecipe}
      style={tw`bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm`}
    >
      {suggestion.recipe.heroImageUrl && (
        <Image
          source={{ uri: suggestion.recipe.heroImageUrl }}
          style={tw`w-full h-40`}
          resizeMode="cover"
        />
      )}

      <View style={tw`p-4`}>
        <View style={tw`flex-row items-start justify-between`}>
          <Text
            style={tw.style(bodyMediumBold, 'text-gray-900 flex-1')}
            numberOfLines={2}
          >
            {suggestion.recipe.title}
          </Text>
          <View
            style={[
              tw`rounded-full px-2.5 py-1 ml-2`,
              { backgroundColor: matchColor + '20' },
            ]}
          >
            <Text style={[tw`text-xs font-bold`, { color: matchColor }]}>
              {suggestion.matchPercentage}% match
            </Text>
          </View>
        </View>

        {suggestion.recipe.shortDescription && (
          <Text
            style={tw.style(bodyMediumRegular, 'text-gray-500 text-xs mt-1')}
            numberOfLines={2}
          >
            {suggestion.recipe.shortDescription}
          </Text>
        )}

        <View style={tw`flex-row gap-3 mt-2`}>
          {suggestion.recipe.prepCookTime && (
            <View style={tw`flex-row items-center gap-1`}>
              <Ionicons name="time-outline" size={14} color="#6B7280" />
              <Text style={tw`text-xs text-gray-500`}>
                {suggestion.recipe.prepCookTime}
              </Text>
            </View>
          )}
          {suggestion.recipe.portions && (
            <View style={tw`flex-row items-center gap-1`}>
              <Ionicons name="people-outline" size={14} color="#6B7280" />
              <Text style={tw`text-xs text-gray-500`}>
                {suggestion.recipe.portions} servings
              </Text>
            </View>
          )}
        </View>

        {suggestion.expiringIngredientsUsed.length > 0 && (
          <View style={tw`flex-row items-center gap-1.5 mt-2 bg-amber-50 rounded-lg px-2.5 py-1.5`}>
            <Ionicons name="warning-outline" size={14} color="#F59E0B" />
            <Text style={tw`text-xs text-amber-700`}>
              Uses expiring: {suggestion.expiringIngredientsUsed.join(', ')}
            </Text>
          </View>
        )}

        {suggestion.aiReason && (
          <View style={tw`flex-row items-start gap-1.5 mt-2 bg-purple-50 rounded-lg px-2.5 py-1.5`}>
            <Ionicons name="sparkles" size={14} color="#7C3AED" />
            <Text style={tw`text-xs text-purple-700 flex-1`}>
              {suggestion.aiReason}
            </Text>
          </View>
        )}

        {suggestion.missingIngredients.length > 0 && (
          <View style={tw`mt-2`}>
            <Text style={tw`text-xs text-gray-400`}>
              Missing: {suggestion.missingIngredients.slice(0, 3).join(', ')}
              {suggestion.missingIngredients.length > 3 &&
                ` +${suggestion.missingIngredients.length - 3} more`}
            </Text>
          </View>
        )}

        {/* Cook CTA */}
        <Pressable
          onPress={goToRecipe}
          style={tw`mt-3 bg-orange-500 rounded-xl py-2.5 flex-row items-center justify-center gap-2`}
        >
          <Ionicons name="restaurant-outline" size={16} color="white" />
          <Text style={tw.style(bodyMediumBold, 'text-white text-sm')}>Cook this recipe</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}
