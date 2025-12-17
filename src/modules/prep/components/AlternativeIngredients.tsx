import tw from '../../../common/tailwind';
import React from 'react';
import { Pressable, ScrollView, Text } from 'react-native';
import { bodyLargeRegular } from '../../../theme/typography';

export default function AlternativeIngredients({
  ingredients,
  selectedIngredient,
  setSelectedIngredient,
}: {
  ingredients: {
    id: string;
    quantity?: string;
    preparation?: string;
    ingredient: {
      id: string;
      title: string;
    }[];
  }[];
  selectedIngredient: string;
  setSelectedIngredient: (ingredientId: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      automaticallyAdjustContentInsets={false}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={tw`pl-5 pr-3`}
    >
      {ingredients &&
        ingredients.map(item => {
          if (!item.ingredient?.[0]?.title) return null;

          return (
            <Pressable
              key={item.id}
              onPress={() => setSelectedIngredient(item.id)}
              style={tw.style(
                `${
                  selectedIngredient === item.id
                    ? 'border border-transparent bg-kale'
                    : 'border border-stone'
                } mr-2 rounded-2xl px-3 py-1.5`,
              )}
            >
              <Text
                style={tw.style(
                  bodyLargeRegular,
                  selectedIngredient === item.id ? 'text-white' : 'text-stone',
                )}
              >
                {item.ingredient[0].title}
              </Text>
            </Pressable>
          );
        })}
    </ScrollView>
  );
}
