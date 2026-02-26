import { Feather } from '@expo/vector-icons';
import PrimaryButton from '../../../../common/components/ThemeButtons/PrimaryButton';
import tw from '../../../../common/tailwind';
import { IFramework } from '../../types/local';
import TrackPostMakeLeftovers from '../TrackPostMakeLeftovers';
import MealCard from '../../../feed/components/MealCard';
import {
  useGetMealSuggestionsQuickQuery,
  useGetLeftoverMakeoverIdeasMutation,
} from '../../../inventory/api/inventoryApi';
import { useGetAllRecipesQuery } from '../../../recipe/api/recipeApi';
import type { MakeoverIdea } from '../../../inventory/api/types';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  Text,
  UIManager,
  View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {
  h6TextStyle,
  bodyMediumRegular,
  bodyMediumBold,
  bodySmallRegular,
  subheadLargeUppercase,
  subheadMediumUppercase,
} from '../../../../theme/typography';
import { cardDrop } from '../../../../theme/shadow';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  framework: IFramework;
  storageLocation: string;
  onDone: () => void;
  isLoading?: boolean;
}

const effortIcon: Record<string, keyof typeof Feather.glyphMap> = {
  easy: 'zap',
  medium: 'trending-up',
};

const effortColor: Record<string, { bg: string; text: string; hex: string }> = {
  easy: { bg: 'bg-mint/20', text: 'text-kale', hex: '#3A7E52' },
  medium: { bg: 'bg-orange/15', text: 'text-orange', hex: '#F99C46' },
};

export default function PostMakeMakeoverQ({
  framework,
  storageLocation,
  onDone,
  isLoading,
}: Props) {
  const { data: mealSuggestions, isLoading: isSuggestionsLoading } =
    useGetMealSuggestionsQuickQuery({ limit: 5 });
  const { data: allRecipes } = useGetAllRecipesQuery();

  const [getMakeoverIdeas] = useGetLeftoverMakeoverIdeasMutation();
  const [aiIdeas, setAiIdeas] = useState<MakeoverIdea[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const result = await getMakeoverIdeas({
          dishName: framework.title,
          storageLocation,
        }).unwrap();
        if (!cancelled && result.ideas?.length > 0) {
          setAiIdeas(result.ideas);
        }
      } catch (err) {
        console.warn('[PostMakeMakeoverQ] AI ideas failed:', err);
      } finally {
        if (!cancelled) setIsAiLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [framework.title, storageLocation]);

  // Find related recipes from DB that match this dish's keywords
  const relatedRecipes = useMemo(() => {
    if (!allRecipes) return [];
    const keywords = framework.title
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 2);
    return allRecipes
      .filter(
        (r) =>
          r._id !== framework.id &&
          r.isActive &&
          keywords.some(
            (kw) =>
              r.title.toLowerCase().includes(kw) ||
              r.shortDescription?.toLowerCase().includes(kw),
          ),
      )
      .slice(0, 4);
  }, [allRecipes, framework.id, framework.title]);

  const useLeftoversIn = (framework as any).useLeftoversIn ?? [];
  const hasAnySuggestion =
    aiIdeas.length > 0 ||
    useLeftoversIn.length > 0 ||
    relatedRecipes.length > 0 ||
    (mealSuggestions && mealSuggestions.length > 0);

  const storageLabel =
    storageLocation === 'pantry'
      ? 'pantry'
      : storageLocation === 'freezer'
        ? 'freezer'
        : 'fridge';

  const toggleExpand = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <View style={tw`h-full w-full justify-between`}>
      <ScrollView contentContainerStyle={tw`px-5 pb-10`}>
        <Animatable.View animation="fadeIn" duration={400} useNativeDriver>
          <Text
            style={tw.style(h6TextStyle, 'pb-2 pt-4 text-center text-white')}
            maxFontSizeMultiplier={1}
          >
            Leftover makeover ideas
          </Text>

          <Text
            style={tw.style(bodyMediumRegular, 'pb-4 text-center text-white')}
          >
            {`Your ${framework.title} is safely in the ${storageLabel}! Here are creative ways to transform it.`}
          </Text>

          {/* AI loading state */}
          {isAiLoading && (
            <View style={tw`items-center py-6`}>
              <ActivityIndicator color="#FFFCF9" size="small" />
              <Text
                style={tw.style(
                  bodySmallRegular,
                  'pt-2 text-center text-white/70',
                )}
              >
                AI is crafting makeover ideas for your {framework.title}...
              </Text>
            </View>
          )}

          {/* AI-generated ideas — tappable & expandable */}
          {!isAiLoading && aiIdeas.length > 0 && (
            <Animatable.View
              animation="fadeInUp"
              duration={400}
              useNativeDriver
            >
              <View style={tw`mb-3 flex-row items-center justify-center`}>
                <Feather name="cpu" size={14} color="rgba(255,255,255,0.6)" />
                <Text
                  style={tw.style(
                    subheadLargeUppercase,
                    'ml-1.5 text-center text-white/80',
                  )}
                >
                  AI-powered ideas
                </Text>
              </View>

              {aiIdeas.map((idea, index) => {
                const isExpanded = expandedIndex === index;
                const effort = effortColor[idea.effort] || effortColor.easy;

                return (
                  <Animatable.View
                    key={`ai-${index}`}
                    animation="fadeInUp"
                    delay={index * 100}
                    duration={350}
                    useNativeDriver
                  >
                    <Pressable onPress={() => toggleExpand(index)}>
                      <View
                        style={[
                          tw.style(
                            'mb-3 rounded-xl border border-strokecream bg-white px-4 py-3.5',
                          ),
                          cardDrop,
                        ]}
                      >
                        {/* Header row */}
                        <View style={tw`flex-row items-center`}>
                          <View
                            style={tw.style(
                              'h-9 w-9 items-center justify-center rounded-full',
                              effort.bg,
                            )}
                          >
                            <Feather
                              name={effortIcon[idea.effort] || 'grid'}
                              size={16}
                              color={effort.hex}
                            />
                          </View>
                          <View style={tw`ml-3 flex-1`}>
                            <Text
                              style={tw.style(bodyMediumBold, 'text-eggplant')}
                              numberOfLines={isExpanded ? undefined : 1}
                            >
                              {idea.title}
                            </Text>
                            {!isExpanded && (
                              <Text
                                style={tw.style(
                                  bodySmallRegular,
                                  'pt-0.5 text-midgray',
                                )}
                                numberOfLines={1}
                              >
                                {idea.description}
                              </Text>
                            )}
                          </View>
                          <Feather
                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                            size={18}
                            color="#575757"
                            style={tw`ml-2`}
                          />
                        </View>

                        {/* Expanded detail */}
                        {isExpanded && (
                          <View style={tw`mt-3 border-t border-strokecream pt-3`}>
                            <Text
                              style={tw.style(
                                bodyMediumRegular,
                                'text-black',
                              )}
                            >
                              {idea.description}
                            </Text>

                            <View
                              style={tw`mt-3 flex-row items-center justify-between`}
                            >
                              <View style={tw`flex-row items-center`}>
                                <View
                                  style={tw.style(
                                    'rounded-full px-2.5 py-1',
                                    effort.bg,
                                  )}
                                >
                                  <Text
                                    style={tw.style(
                                      'text-xs font-sans-bold',
                                      effort.text,
                                    )}
                                  >
                                    {idea.effort === 'easy'
                                      ? 'Quick & easy'
                                      : 'Worth the effort'}
                                  </Text>
                                </View>
                              </View>
                              <View style={tw`flex-row items-center`}>
                                <Feather
                                  name="clock"
                                  size={13}
                                  color="#575757"
                                />
                                <Text
                                  style={tw.style(
                                    bodySmallRegular,
                                    'ml-1 text-midgray',
                                  )}
                                >
                                  ~{idea.timeMinutes} min
                                </Text>
                              </View>
                            </View>
                          </View>
                        )}

                        {/* Compact badges (collapsed) */}
                        {!isExpanded && (
                          <View style={tw`mt-2 flex-row items-center`}>
                            <View
                              style={tw.style(
                                'rounded-full px-2.5 py-0.5',
                                effort.bg,
                              )}
                            >
                              <Text
                                style={tw.style(
                                  'text-xs font-sans-bold',
                                  effort.text,
                                )}
                              >
                                {idea.effort === 'easy'
                                  ? 'Quick & easy'
                                  : 'Worth the effort'}
                              </Text>
                            </View>
                            <View style={tw`ml-2 flex-row items-center`}>
                              <Feather
                                name="clock"
                                size={12}
                                color="#575757"
                              />
                              <Text
                                style={tw.style(
                                  bodySmallRegular,
                                  'ml-1 text-midgray',
                                )}
                              >
                                ~{idea.timeMinutes} min
                              </Text>
                            </View>
                          </View>
                        )}
                      </View>
                    </Pressable>
                  </Animatable.View>
                );
              })}
            </Animatable.View>
          )}

          {/* Framework-linked leftover recipes */}
          {useLeftoversIn.length > 0 && (
            <TrackPostMakeLeftovers meals={useLeftoversIn} />
          )}

          {/* Related recipes from DB — MealCard style */}
          {relatedRecipes.length > 0 && (
            <View style={tw`mt-6`}>
              <Text
                style={tw.style(
                  subheadLargeUppercase,
                  'pb-1 text-center text-white',
                )}
              >
                Related recipes
              </Text>
              <Text
                style={tw.style(
                  bodySmallRegular,
                  'pb-3 text-center text-white/80',
                )}
              >
                More dishes that go well with {framework.title}
              </Text>
              <View style={tw`flex-row flex-wrap justify-between`}>
                {relatedRecipes.map((recipe) => (
                  <View key={recipe._id} style={tw`mb-3 w-[48%]`}>
                    <MealCard
                      id={recipe._id}
                      heroImage={
                        recipe.heroImageUrl
                          ? [{ url: recipe.heroImageUrl } as any]
                          : undefined
                      }
                      title={recipe.title}
                    />
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Pantry-based meal suggestions */}
          {!isSuggestionsLoading &&
            mealSuggestions &&
            mealSuggestions.length > 0 && (
              <View style={tw`mt-6`}>
                <Text
                  style={tw.style(
                    subheadLargeUppercase,
                    'pb-1 text-center text-white',
                  )}
                >
                  From your pantry
                </Text>
                <Text
                  style={tw.style(
                    bodySmallRegular,
                    'pb-3 text-center text-white/80',
                  )}
                >
                  Recipes you can cook with what you already have
                </Text>
                {mealSuggestions.slice(0, 3).map((suggestion) => (
                  <View
                    key={suggestion.recipe._id}
                    style={[
                      tw.style(
                        'mb-2 flex-row items-center rounded-xl border border-strokecream bg-white px-4 py-3',
                      ),
                      cardDrop,
                    ]}
                  >
                    {suggestion.recipe.heroImageUrl ? (
                      <Image
                        source={{ uri: suggestion.recipe.heroImageUrl }}
                        style={tw`h-12 w-12 rounded-lg`}
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        style={tw`h-12 w-12 items-center justify-center rounded-lg bg-creme`}
                      >
                        <Feather name="book-open" size={20} color="#4B2176" />
                      </View>
                    )}
                    <View style={tw`ml-3 flex-1`}>
                      <Text
                        style={tw.style(bodyMediumBold)}
                        numberOfLines={1}
                      >
                        {suggestion.recipe.title}
                      </Text>
                      <View style={tw`flex-row items-center pt-0.5`}>
                        <Text
                          style={tw.style(bodySmallRegular, 'text-midgray')}
                          numberOfLines={1}
                        >
                          {suggestion.matchPercentage}% match
                        </Text>
                        {suggestion.recipe.prepCookTime ? (
                          <>
                            <View
                              style={tw`mx-1.5 h-1 w-1 rounded-full bg-midgray`}
                            />
                            <Feather
                              name="clock"
                              size={11}
                              color="#575757"
                            />
                            <Text
                              style={tw.style(
                                bodySmallRegular,
                                'ml-0.5 text-midgray',
                              )}
                            >
                              {suggestion.recipe.prepCookTime}
                            </Text>
                          </>
                        ) : null}
                      </View>
                    </View>
                    <Feather name="chevron-right" size={16} color="#575757" />
                  </View>
                ))}
              </View>
            )}

          {/* Empty state */}
          {!isAiLoading && !isSuggestionsLoading && !hasAnySuggestion && (
            <View style={tw`items-center py-8`}>
              <Image
                style={tw`mx-auto mb-4 h-[120px] w-[120px]`}
                resizeMode="contain"
                source={{ uri: 'https://d3fg04h02j12vm.cloudfront.net/placeholder/frying-pan.png' }}
                accessibilityIgnoresInvertColors
              />
              <Text
                style={tw.style(
                  bodyMediumRegular,
                  'px-4 text-center text-white',
                )}
              >
                {`Get creative with your leftovers! ${framework.title} can be transformed into wraps, bowls, fried rice, and more.`}
              </Text>
            </View>
          )}
        </Animatable.View>
      </ScrollView>

      <View style={tw`px-5`}>
        <PrimaryButton
          style={tw.style('mb-2')}
          buttonSize="large"
          onPress={onDone}
          loading={isLoading}
          disabled={isLoading}
          iconRight="check"
        >
          Done
        </PrimaryButton>
      </View>
    </View>
  );
}
