import { Feather } from '@expo/vector-icons';
import tw from '../../../common/tailwind';
import React from 'react';
import { LayoutAnimation, Pressable, Text, View } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { ScrollView } from 'react-native-gesture-handler';
import { cardIngredientDrop } from '../../../theme/shadow';
import {
  bodyLargeBold,
  bodyMediumRegular,
  subheadLargeUppercase,
} from '../../../theme/typography';
import { getScaledQuantityForIngredient } from '../hooks/useServingScale';

export default function RelevantIngredients({
  ingredients,
  isIngredientsActive,
  setIsIngredientsActive,
  scaledQuantities,
}: {
  ingredients: {
    id: string;
    title: string;
    quantity?: string;
    preparation?: string;
    ingredientId?: string;
  }[];
  isIngredientsActive: boolean;
  setIsIngredientsActive: (value: boolean) => void;
  /** Map of ingredient ID -> scaled quantity from AI serving scale */
  scaledQuantities?: Map<string, string>;
}) {
  const toggleIngredients = (value: boolean) => {
    /* Adding LayoutAnimation causes warning, trying to fix this  */
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsIngredientsActive(value);
  };

  const hasScaledQuantities = scaledQuantities && scaledQuantities.size > 0;

  return (
    <View
      style={[
        tw.style(
          `px-4.5 absolute bottom-0 left-0 right-0 z-50 rounded-tl-[25px] rounded-tr-[25px] border border-b-0 border-creme-3 bg-kale py-6`,
          isIngredientsActive ? 'top-1/2' : '',
        ),
        cardIngredientDrop,
      ]}
    >
      <Pressable
        onPress={() => {
          toggleIngredients(!isIngredientsActive);
        }}
      >
        <View style={tw`flex-row items-center justify-between gap-3 pb-2`}>
          <View style={tw`flex-row items-center gap-2`}>
            <Text
              style={tw.style(subheadLargeUppercase, 'text-strokecream')}
              maxFontSizeMultiplier={1}
            >
              Ingredients
            </Text>
            {hasScaledQuantities && (
              <View style={tw`rounded-full bg-[#FF6B35] bg-opacity-25 px-2 py-0.5`}>
                <Text
                  style={tw.style('font-sans text-[10px] text-[#FF6B35]')}
                  maxFontSizeMultiplier={1}
                >
                  Scaled
                </Text>
              </View>
            )}
          </View>
          <Feather
            name={isIngredientsActive ? 'chevrons-down' : 'chevrons-up'}
            size={24}
            color={tw.color('creme')}
          />
        </View>
      </Pressable>

      {isIngredientsActive && (
        <ScrollView
          style={tw`max-h-[40vh]`}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          <Animatable.View
            animation="fadeIn"
            duration={300}
            style={tw`pb-4`}
          >
            {ingredients.map((ingredient, index) => {
              const displayQuantity = hasScaledQuantities
                ? getScaledQuantityForIngredient(
                    scaledQuantities,
                    ingredient.ingredientId || ingredient.id,
                    ingredient.title,
                    ingredient.quantity ?? '',
                  )
                : (ingredient.quantity ?? '');

              const isScaled =
                hasScaledQuantities &&
                displayQuantity !== (ingredient.quantity ?? '');

              return (
                <View
                  key={index}
                  style={tw`relative flex-row items-start justify-start gap-3 border-b border-creme py-5`}
                >
                  <View style={tw`w-21`}>
                    <Text
                      style={tw.style(
                        bodyMediumRegular,
                        isScaled ? 'text-[#FF6B35]' : 'text-creme',
                      )}
                    >
                      {displayQuantity}
                    </Text>
                    {isScaled && (
                      <Text
                        style={tw.style(
                          'font-sans text-xs text-strokecream line-through opacity-60',
                        )}
                      >
                        {ingredient.quantity}
                      </Text>
                    )}
                  </View>
                  <View style={tw`shrink gap-1`}>
                    <Text style={tw.style(bodyLargeBold, 'text-creme')}>
                      {ingredient.title}
                    </Text>
                    {ingredient.preparation && (
                      <Text style={tw.style(bodyMediumRegular, 'text-creme')}>
                        {ingredient.preparation}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </Animatable.View>
        </ScrollView>
      )}
    </View>
  );
}