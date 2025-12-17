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

export default function RelevantIngredients({
  ingredients,
  isIngredientsActive,
  setIsIngredientsActive,
}: {
  ingredients: {
    id: string;
    title: string;
    quantity?: string;
    preparation?: string;
  }[];
  isIngredientsActive: boolean;
  setIsIngredientsActive: (value: boolean) => void;
}) {
  const toggleIngredients = (value: boolean) => {
    /* Adding LayoutAnimation causes warning, trying to fix this  */
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsIngredientsActive(value);
  };

  return (
    <View
      style={[
        tw.style(
          `px-4.5 absolute bottom-0 left-0 right-0 z-10 rounded-tl-[25px] rounded-tr-[25px] border border-b-0 border-creme-3 bg-kale py-6`,
          isIngredientsActive ? 'top-1/2' : '',
        ),
        cardIngredientDrop,
      ]}
    >
      <ScrollView
        automaticallyAdjustContentInsets
        // contentContainerStyle={tw.style('border')}
      >
        <Pressable
          onPress={() => {
            toggleIngredients(!isIngredientsActive);
          }}
        >
          <View style={tw`flex-row items-center justify-between gap-3`}>
            <Text
              style={tw.style(subheadLargeUppercase, 'text-strokecream')}
              maxFontSizeMultiplier={1}
            >
              Ingredients
            </Text>
            <Feather
              name={isIngredientsActive ? 'chevrons-down' : 'chevrons-up'}
              size={24}
              color={tw.color('creme')}
            />
          </View>
          <Animatable.View
            style={tw.style(
              `${isIngredientsActive ? 'mb-10' : 'h-0 overflow-hidden'}`,
            )}
            duration={300}
          >
            {ingredients.map((ingredient, index) => (
              <View
                key={index}
                style={tw`relative flex-row items-start justify-start gap-3 border-b border-creme py-5`}
              >
                <Text style={tw.style(bodyMediumRegular, 'w-21 text-creme')}>
                  {ingredient.quantity ?? ''}
                </Text>
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
            ))}
          </Animatable.View>
        </Pressable>
      </ScrollView>
    </View>
  );
}
