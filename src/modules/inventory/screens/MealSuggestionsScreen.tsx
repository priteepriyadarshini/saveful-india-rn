import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  ImageBackground,
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
import { useGetMealSuggestionsQuery } from '../api/inventoryApi';
import MealCard from '../../make/components/MealCard';

function getMatchColor(pct: number): string {
  if (pct >= 80) return '#22C55E';
  if (pct >= 60) return '#F59E0B';
  return '#3B82F6';
}

export default function MealSuggestionsScreen() {
  const navigation = useNavigation<any>();
  const [maxHeight, setMaxHeight] = useState<number>(0);
  const {
    data: suggestions,
    isLoading,
    isError,
    refetch,
  } = useGetMealSuggestionsQuery();

  return (
    <SafeAreaView style={tw`flex-1 bg-creme`} edges={['top']}>
      <View style={tw`px-5 pt-3 pb-3 flex-row items-center bg-white border-b border-strokecream`}>
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

      <ImageBackground
        style={tw`flex-1`}
        source={require('../../../../assets/ribbons/lemon.png')}
        
      >
        {isLoading ? (
          <View style={tw`flex-1 items-center justify-center`}>
            <ActivityIndicator size="large" color={tw.color('eggplant') || '#7E42FF'} />
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
              style={tw`mt-3 bg-eggplant px-6 py-2 rounded-full`}
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
          <ScrollView style={tw`flex-1`} contentContainerStyle={tw`pb-6 pt-4`}>
            <Text
              style={tw.style(h6TextStyle, 'mb-3 px-5 text-center')}
              maxFontSizeMultiplier={1}
            >
              COOK FROM YOUR KITCHEN
            </Text>

            <View style={tw`w-full px-5 gap-2`}>
              {suggestions.map((suggestion) => {
                const matchColor = getMatchColor(suggestion.matchPercentage);
                return (
                  <View key={suggestion.recipe._id} style={tw`relative`}>
                    <View
                      style={[
                        tw`absolute top-3 left-3 z-20 rounded-full px-2.5 py-1`,
                        { backgroundColor: matchColor + '33' },
                      ]}
                      pointerEvents="none"
                    >
                      <Text style={[tw`text-xs font-bold`, { color: matchColor }]}>
                        {suggestion.matchPercentage}% match
                      </Text>
                    </View>

                    {suggestion.expiringIngredientsUsed.length > 0 && (
                      <View
                        style={tw`absolute bottom-3 left-3 z-20 flex-row items-center gap-1 bg-amber-500 rounded-full px-2 py-0.5`}
                        pointerEvents="none"
                      >
                        <Ionicons name="warning-outline" size={11} color="white" />
                        <Text style={tw`text-[10px] text-white font-bold`}>
                          Uses expiring ingredients
                        </Text>
                      </View>
                    )}

                    <MealCard
                      id={suggestion.recipe._id}
                      heroImage={[{ url: suggestion.recipe.heroImageUrl || '' }] as any}
                      title={suggestion.recipe.title}
                      variantTags={[] as any}
                      maxHeight={maxHeight}
                      setMaxHeight={setMaxHeight}
                    />
                  </View>
                );
              })}
            </View>
          </ScrollView>
        )}
      </ImageBackground>
    </SafeAreaView>
  );
}
