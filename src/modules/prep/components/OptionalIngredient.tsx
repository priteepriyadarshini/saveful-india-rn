import { Feather } from '@expo/vector-icons';
import tw from '../../../common/tailwind';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { bodyLargeMedium, bodyMediumRegular } from '../../../theme/typography';

export default function OptionalIngredient({
  ingredient,
  index,
  onIngredientChecked,
}: {
  ingredient: {
    id: string;
    quantity?: string;
    preparation?: string;
    ingredient: {
      id: string;
      title: string;
    }[];
  };
  index: number;
  onIngredientChecked: (ingredientId: string) => void;
}) {
  return (
    <View
      key={ingredient.id}
      style={tw.style(
        'gap-2.5 border-b border-strokecream',
        index > 0 ? 'pt-3.5' : 'pt-0',
      )}
    >
      {(ingredient.quantity || ingredient.preparation) && (
        <Text style={tw.style(bodyMediumRegular)}>
          {ingredient.quantity}
          {ingredient.quantity && ingredient.preparation
            ? `, ${ingredient.preparation}`
            : ''}
          {!ingredient.quantity && ingredient.preparation
            ? `${ingredient.preparation}`
            : ''}
        </Text>
      )}
      <View style={tw.style('flex-row justify-between')}>
        <Text style={tw.style(bodyLargeMedium, 'pb-3.5')}>
          {ingredient.ingredient[0].title}
        </Text>
        <Pressable
          style={tw.style('pt-0.5')}
          onPress={() => onIngredientChecked(ingredient.ingredient[0].id)}
        >
          <Feather name="x" size={16} color={tw.color('black')} />
        </Pressable>
      </View>
    </View>
  );
}
