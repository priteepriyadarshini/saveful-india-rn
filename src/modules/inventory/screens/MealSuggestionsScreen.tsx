import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  ImageBackground,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import tw from '../../../common/tailwind';
import { useNavigation, CommonActions } from '@react-navigation/native';
import {
  bodyMediumRegular,
  bodyMediumBold,
  h6TextStyle,
  subheadSmallUppercase,
} from '../../../theme/typography';
import {
  useGetMealSuggestionsQuickQuery,
  useGetInventoryGroupedQuery,
} from '../api/inventoryApi';
import {
  useGenerateFromIngredientsMutation,
  useGetAiGenerationCountQuery,
} from '../../cookbook/api/cookbookApi';
import MealCard from '../../make/components/MealCard';
import { InventoryStackScreenProps } from '../navigation/InventoryNavigator';
import { MealSuggestion } from '../api/types';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
  isSpeechRecognitionAvailable,
} from '../utils/speechRecognition';

export default function MealSuggestionsScreen({
  route,
}: InventoryStackScreenProps<'InventoryMealSuggestions'>) {
  const navigation = useNavigation();
  const [maxHeight, setMaxHeight] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [selectedIngredientId, setSelectedIngredientId] = useState<
    string | undefined
  >();
  const [isListening, setIsListening] = useState(false);
  const finalTranscriptRef = useRef('');

  useSpeechRecognitionEvent('result', (event: any) => {
    const latest = event.results?.[0]?.transcript || '';
    if (!latest) return;
    if (event.isFinal) finalTranscriptRef.current = latest;
    setSearchText(latest);
    if (selectedIngredientId) setSelectedIngredientId(undefined);
  });

  useSpeechRecognitionEvent('end', () => setIsListening(false));
  useSpeechRecognitionEvent('error', () => setIsListening(false));

  const stopListening = useCallback(() => {
    setIsListening(false);
    ExpoSpeechRecognitionModule?.stop();
  }, []);

  const startListening = useCallback(async () => {
    if (!isSpeechRecognitionAvailable || !ExpoSpeechRecognitionModule) {
      Alert.alert('Voice unavailable', 'Voice input requires a development build.');
      return;
    }
    try {
      const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission Required', 'Microphone permission is needed for voice search.');
        return;
      }
      finalTranscriptRef.current = '';
      setIsListening(true);
      ExpoSpeechRecognitionModule.start({ lang: 'en-IN', interimResults: true, continuous: false });
    } catch {
      setIsListening(false);
      Alert.alert('Error', 'Unable to start voice input on this device.');
    }
  }, []);

  useEffect(() => {
    return () => { if (isListening) ExpoSpeechRecognitionModule?.stop(); };
  }, [isListening]);

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

  // --- AI Recipe Generation ---
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPreference, setAiPreference] = useState('');
  const [generateFromIngredients, { isLoading: isGenerating }] =
    useGenerateFromIngredientsMutation();
  const { data: aiCountData } = useGetAiGenerationCountQuery();

  const aiRemaining = aiCountData?.remaining ?? 3;
  const aiLimitReached = aiRemaining <= 0;

  const handleAiGenerate = useCallback(async () => {
    if (aiLimitReached) {
      Alert.alert(
        'Limit Reached',
        'You have used all 3 of your free AI recipe generations. Stay tuned for our subscription plan!',
      );
      return;
    }

    const ingredientNames = inventoryIngredients.map((i) => i.name);
    if (ingredientNames.length === 0) {
      Alert.alert(
        'No Ingredients',
        'Add ingredients to your kitchen inventory first.',
      );
      return;
    }

    try {
      const result = await generateFromIngredients({
        ingredients: ingredientNames,
        preference: aiPreference.trim() || undefined,
      }).unwrap();

      setShowAiModal(false);
      setAiPreference('');

      if (result.success && result.queued) {
        Alert.alert(
          'Recipe Being Generated!',
          'Your AI recipe is being crafted. You\'ll be notified when it\'s ready in your Cookbook.',
          [
            {
              text: 'Go to Cookbook',
              onPress: () => {
                navigation.dispatch(
                  CommonActions.navigate({
                    name: 'Cookbook',
                    params: { screen: 'CookbookHome' },
                  }),
                );
              },
            },
            { text: 'Stay Here', style: 'cancel' },
          ],
        );
      } else if (result.limitReached) {
        Alert.alert(
          'Limit Reached',
          result.message || 'You have used all your free recipe generations.',
        );
      } else {
        Alert.alert(
          'Generation Failed',
          result.message || 'Could not generate recipe. Please try again.',
        );
      }
    } catch (error: any) {
      setShowAiModal(false);
      const serverMsg =
        typeof error?.data?.message === 'string'
          ? error.data.message
          : 'Something went wrong. Please try again.';
      Alert.alert('Error', serverMsg);
    }
  }, [
    aiLimitReached,
    inventoryIngredients,
    aiPreference,
    generateFromIngredients,
    navigation,
  ]);

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
              placeholder={isListening ? 'Listening…' : 'Search by ingredients...'}
              placeholderTextColor={isListening ? '#7C3AED' : '#9CA3AF'}
              value={searchText}
              onChangeText={(text) => {
                setSearchText(text);
                if (selectedIngredientId) setSelectedIngredientId(undefined);
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchText.length > 0 && !isListening && (
              <Pressable onPress={handleClearSearch} style={tw`mr-1`}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </Pressable>
            )}
            <Pressable
              onPress={isListening ? stopListening : startListening}
              style={tw.style(
                'w-8 h-8 rounded-full items-center justify-center ml-1',
                isListening ? 'bg-red-100' : 'bg-purple-100',
              )}
              accessibilityRole="button"
              accessibilityLabel={isListening ? 'Stop voice search' : 'Start voice search'}
            >
              <Ionicons
                name={isListening ? 'stop' : 'mic'}
                size={16}
                color={isListening ? '#EF4444' : '#7C3AED'}
              />
            </Pressable>
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
          <View style={tw`items-center justify-center py-12 px-4`}>
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

            {/* AI Generation CTA in empty state */}
            {inventoryIngredients.length > 0 && (
              <View style={tw`mt-6 rounded-2xl bg-purple-50 border border-purple-200 px-5 py-5 w-full`}>
                <View style={tw`items-center`}>
                  <Ionicons name="sparkles" size={24} color="#7C3AED" />
                  <Text style={tw.style(bodyMediumBold, 'text-gray-900 text-center mt-2')}>
                    Let Saveful AI create a recipe for you
                  </Text>
                  <Text style={tw.style(bodyMediumRegular, 'text-gray-500 text-center text-xs mt-1')}>
                    Using your kitchen ingredients
                  </Text>
                  <Pressable
                    onPress={() => {
                      if (aiLimitReached) {
                        Alert.alert(
                          'Limit Reached',
                          'You have used all 3 of your free recipe generations. Stay tuned for our subscription plan!',
                        );
                      } else {
                        setShowAiModal(true);
                      }
                    }}
                    style={tw.style(
                      'mt-3 px-6 py-2.5 rounded-full flex-row items-center',
                      aiLimitReached ? 'bg-gray-300' : 'bg-purple-600',
                    )}
                  >
                    <Ionicons name="sparkles" size={14} color="#fff" />
                    <Text style={tw.style(bodyMediumBold, 'text-white ml-1.5 text-sm')}>
                      {aiLimitReached ? 'Limit Reached' : 'Generate AI Recipe'}
                    </Text>
                  </Pressable>
                </View>
              </View>
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
              const matched = suggestion.matchedIngredients || [];
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
                  {matched.length > 0 && (
                    <View
                      style={[
                        tw`bg-white rounded-b-2xl px-3 pb-3 pt-2`,
                        { borderWidth: 1, borderTopWidth: 0, borderColor: '#E5E7EB' },
                      ]}
                    >
                      <Text
                        style={tw.style(
                          subheadSmallUppercase,
                          'mb-2 text-midgray',
                        )}
                      >
                        This meal uses :
                      </Text>
                      <View style={tw`flex-row flex-wrap gap-1`}>
                        {matched.map((ing, idx) => (
                          <View
                            key={idx}
                            style={tw`rounded-lg bg-strokecream px-2 py-0.5`}
                          >
                            <Text style={tw.style(subheadSmallUppercase)}>
                              {ing}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              );
            })}

            {/* AI Recipe Generation CTA */}
            <View style={tw`mx-4 mt-4 mb-2 rounded-2xl bg-purple-50 border border-purple-200 px-5 py-5`}>
              <View style={tw`items-center`}>
                <View style={tw`w-12 h-12 rounded-full bg-purple-100 items-center justify-center mb-3`}>
                  <Ionicons name="sparkles" size={24} color="#7C3AED" />
                </View>
                <Text style={tw.style(bodyMediumBold, 'text-gray-900 text-center text-base')}>
                  Not finding what you want?
                </Text>
                <Text style={tw.style(bodyMediumRegular, 'text-gray-500 text-center text-xs mt-1 leading-4')}>
                  Let Saveful AI create a custom recipe{'\n'}using your kitchen ingredients
                </Text>
                {!aiLimitReached && (
                  <Text style={tw.style(bodyMediumRegular, 'text-purple-600 text-xs mt-1')}>
                    {aiRemaining} free generation{aiRemaining !== 1 ? 's' : ''} remaining
                  </Text>
                )}
                <Pressable
                  onPress={() => {
                    if (aiLimitReached) {
                      Alert.alert(
                        'Limit Reached',
                        'You have used all 3 of your free recipe generations. Stay tuned for our subscription plan!',
                      );
                    } else {
                      setShowAiModal(true);
                    }
                  }}
                  style={tw.style(
                    'mt-3 px-6 py-3 rounded-full flex-row items-center',
                    aiLimitReached ? 'bg-gray-300' : 'bg-purple-600',
                  )}
                >
                  <Ionicons name="sparkles" size={16} color="#fff" />
                  <Text style={tw.style(bodyMediumBold, 'text-white ml-2')}>
                    {aiLimitReached ? 'Limit Reached' : 'Generate AI Recipe'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
      </ImageBackground>

      <Modal
        visible={showAiModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => !isGenerating && setShowAiModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={tw`flex-1`}
        >
          <Pressable
            style={tw`flex-1 bg-black/50 items-center justify-center px-6`}
            onPress={() => !isGenerating && setShowAiModal(false)}
          >
            <Pressable
              style={tw`bg-white rounded-2xl p-6 w-full`}
              onPress={() => {}}
            >
              <View style={tw`items-center mb-4`}>
                <View style={tw`w-14 h-14 rounded-full bg-purple-100 items-center justify-center mb-3`}>
                  <Ionicons name="sparkles" size={28} color="#7C3AED" />
                </View>
                <Text style={tw.style(bodyMediumBold, 'text-gray-900 text-center text-base')}>
                  AI Recipe Generator
                </Text>
                <Text style={tw.style(bodyMediumRegular, 'text-gray-500 text-center text-xs mt-1')}>
                  We'll use your {inventoryIngredients.length} kitchen ingredient{inventoryIngredients.length !== 1 ? 's' : ''} to create a recipe
                </Text>
              </View>

              <Text style={tw.style(bodyMediumBold, 'text-gray-700 text-xs mb-1.5')}>
                What kind of recipe do you want? (optional)
              </Text>
              <TextInput
                style={[
                  tw.style(
                    bodyMediumRegular,
                    'bg-gray-50 rounded-xl px-4 py-3 text-gray-900 border border-gray-200',
                  ),
                  { fontSize: 14, minHeight: 80, textAlignVertical: 'top' },
                ]}
                placeholder="e.g. something spicy, a quick snack, South Indian breakfast, healthy dinner..."
                placeholderTextColor="#9CA3AF"
                value={aiPreference}
                onChangeText={setAiPreference}
                multiline
                maxLength={200}
                editable={!isGenerating}
              />

              <View style={tw`flex-row gap-3 mt-5`}>
                <Pressable
                  onPress={() => {
                    setShowAiModal(false);
                    setAiPreference('');
                  }}
                  disabled={isGenerating}
                  style={tw.style(
                    'flex-1 py-3 rounded-full border border-gray-300 items-center',
                    isGenerating ? 'opacity-50' : '',
                  )}
                >
                  <Text style={tw.style(bodyMediumBold, 'text-gray-600')}>
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleAiGenerate}
                  disabled={isGenerating}
                  style={tw.style(
                    'flex-1 py-3 rounded-full items-center flex-row justify-center',
                    isGenerating ? 'bg-purple-400' : 'bg-purple-600',
                  )}
                >
                  {isGenerating ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="sparkles" size={14} color="#fff" />
                      <Text style={tw.style(bodyMediumBold, 'text-white ml-1.5')}>
                        Generate
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>

              <Text style={tw.style(bodyMediumRegular, 'text-purple-500 text-center text-xs mt-3')}>
                {aiRemaining} free generation{aiRemaining !== 1 ? 's' : ''} remaining
              </Text>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}