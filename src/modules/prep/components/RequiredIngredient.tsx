import tw from '../../../common/tailwind';
import AlternativeIngredients from '../../../modules/prep/components/AlternativeIngredients';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { bodyLargeMedium, bodyMediumRegular } from '../../../theme/typography';

export default function RequiredIngredient({
  id,
  index,
  recommendedIngredient,
  quantity,
  preparation,
  alternativeIngredients,
  scaledQuantities,
  //
  setSelectedRequiredIngredients,
}: {
  id: string;
  index: number;
  recommendedIngredient: {
    id: string;
    title: string;
  }[];
  quantity: string;
  preparation?: string;
  alternativeIngredients?: {
    id: string;
    ingredient: {
      id: string;
      title: string;
    }[];
    alternativeOptions?: ['inheritQuantity' | 'inheritPreparation'];
    quantity: string;
    preparation?: string;
  }[];
  /** Pre-computed scaled quantities from AI */
  scaledQuantities?: Record<string, string>;
  //
  setSelectedRequiredIngredients: (
    ingredient: {
      id: string;
      title: string;
      quantity: string;
      preparation?: string;
      ingredientId: string;
    },
    index: number,
  ) => void;
}) {
  const [selectedIngredientQuantity, setSelectedIngredientQuantity] =
    useState(quantity);
  const [selectedIngredientPreparation, setSelectedIngredientPreparation] =
    useState(preparation);

  // Resolve scaled quantity for this ingredient
  const ingredientId = recommendedIngredient[0]?.id;
  const scaledQty = scaledQuantities
    ? (scaledQuantities[ingredientId] ||
       scaledQuantities[`name:${recommendedIngredient[0]?.title?.toLowerCase()}`])
    : undefined;
  const isScaled = !!scaledQty && scaledQty !== selectedIngredientQuantity;

  // Initialize state with the required ingredient
  const [selectedAlternativeIngredient, setSelectedAlternativeIngredient] =
    useState(id);

  // Function to handle changing the ingedient
  const selectAlternativeIngredient = (itemId: string) => {
    setSelectedAlternativeIngredient(itemId);

    // Find the ingredient that was selected
    const selectedIngredient = alternativeIngredients?.find(
      item => item.id === itemId,
    );

    if (selectedIngredient) {
      setSelectedRequiredIngredients(
        {
          id,
          title: selectedIngredient?.ingredient[0].title,
          quantity,
          preparation,
          ingredientId: selectedIngredient?.ingredient[0].id,
        },
        index,
      );
      // Check if the quantity should be inherited
      if (selectedIngredient.alternativeOptions) {
        if (
          !selectedIngredient.alternativeOptions.includes('inheritQuantity')
        ) {
          setSelectedIngredientQuantity(selectedIngredient.quantity);
        }
        if (
          !selectedIngredient.alternativeOptions.includes('inheritPreparation')
        ) {
          setSelectedIngredientPreparation(selectedIngredient.preparation);
        }
        setSelectedRequiredIngredients(
          {
            id,
            title: selectedIngredient?.ingredient[0].title,
            quantity: !selectedIngredient.alternativeOptions.includes(
              'inheritQuantity',
            )
              ? selectedIngredient?.quantity
              : quantity,
            preparation: !selectedIngredient.alternativeOptions.includes(
              'inheritPreparation',
            )
              ? selectedIngredient?.preparation
              : preparation,
            ingredientId: selectedIngredient?.ingredient[0].id,
          },
          index,
        );
      }
    } else {
      setSelectedIngredientQuantity(quantity);
      setSelectedIngredientPreparation(preparation);
      setSelectedRequiredIngredients(
        {
          id,
          title: recommendedIngredient[0].title,
          quantity,
          preparation,
          ingredientId: recommendedIngredient[0].id,
        },
        index,
      );
    }
  };

  return (
    <View style={tw.style('gap-2.5', index === 0 ? 'mt-0' : 'mt-3.5')}>
      {index !== 0 && (
        <View style={tw.style('mx-5 border-t border-strokecream pt-1')} />
      )}
      {(selectedIngredientQuantity || selectedIngredientPreparation) && (
        <View style={tw.style('px-5')}>
          {isScaled ? (
            <View style={tw.style('flex-row items-center gap-2')}>
              <Text style={tw.style(bodyMediumRegular, 'text-[#FF6B35]')}>
                {scaledQty}
                {selectedIngredientPreparation
                  ? `, ${selectedIngredientPreparation}`
                  : ''}
              </Text>
              <Text style={tw.style('font-sans text-xs text-midgray line-through')}>
                {selectedIngredientQuantity}
              </Text>
            </View>
          ) : (
            <Text style={tw.style(bodyMediumRegular)}>
              {selectedIngredientQuantity}
              {selectedIngredientQuantity && selectedIngredientPreparation
                ? `, ${selectedIngredientPreparation}`
                : ''}
              {!selectedIngredientQuantity && selectedIngredientPreparation
                ? `${selectedIngredientPreparation}`
                : ''}
            </Text>
          )}
        </View>
      )}

      {alternativeIngredients && alternativeIngredients?.length > 0 ? (
        <AlternativeIngredients
          ingredients={[
            {
              id,
              ingredient: recommendedIngredient,
              quantity,
              preparation,
            },
            ...alternativeIngredients,
          ]}
          selectedIngredient={selectedAlternativeIngredient}
          setSelectedIngredient={selectAlternativeIngredient}
        />
      ) : (
        <Text style={tw.style(bodyLargeMedium, 'px-5')}>
          {recommendedIngredient[0].title}
        </Text>
      )}
    </View>
  );
}
