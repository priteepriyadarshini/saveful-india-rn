import React, { useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import tw from '../../../common/tailwind';
import { h6TextStyle, bodyMediumRegular, bodyMediumBold, bodySmallRegular } from '../../../theme/typography';
import { useAddIngredientsFromRecipeMutation } from '../../shoppingList/api/shoppingListApi';

interface Ingredient {
  id: string;
  title: string;
  quantity: string;
  preparation?: string;
  averageWeight?: number;
}

interface ShoppingListIngredientsModalProps {
  isVisible: boolean;
  onClose: () => void;
  ingredients: Ingredient[];
  recipeId: string;
  recipeName?: string;
}

export default function ShoppingListIngredientsModal({
  isVisible,
  onClose,
  ingredients,
  recipeId,
  recipeName,
}: ShoppingListIngredientsModalProps) {
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set());
  const [addIngredientsFromRecipe, { isLoading: loading }] = useAddIngredientsFromRecipeMutation();
  const [successMessage, setSuccessMessage] = useState(false);

  // Deduplicate ingredients by ID
  const uniqueIngredients = React.useMemo(() => {
    const seen = new Map<string, Ingredient>();
    ingredients.forEach((ing) => {
      if (!seen.has(ing.id)) {
        seen.set(ing.id, ing);
      }
    });
    return Array.from(seen.values());
  }, [ingredients]);

  const toggleIngredient = useCallback((ingredientId: string) => {
    setSelectedIngredients((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(ingredientId)) {
        newSet.delete(ingredientId);
      } else {
        newSet.add(ingredientId);
      }
      return newSet;
    });
  }, []);

  const handleAddToShoppingList = async () => {
    if (selectedIngredients.size === 0) return;

    try {
      const ingredientsToAdd = uniqueIngredients
        .filter((ing) => selectedIngredients.has(ing.id))
        .map((ing) => ({
          ingredientName: ing.title,
        }));

      await addIngredientsFromRecipe({
        recipeId,
        ingredients: ingredientsToAdd,
      }).unwrap();

      setSuccessMessage(true);
      setTimeout(() => {
        setSelectedIngredients(new Set());
        setSuccessMessage(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error adding to shopping list:', error);
    }
  };

  const handleSkip = () => {
    setSelectedIngredients(new Set());
    onClose();
  };

  return (
    <Modal animationType="fade" transparent visible={isVisible} onRequestClose={handleSkip}>
      <View style={tw`z-10 flex-1 items-center justify-center bg-black bg-opacity-50 px-5`}>
        <Animatable.View
          animation="fadeInUp"
          duration={500}
          useNativeDriver
          style={tw`w-full max-w-[400px] rounded-2lg bg-white`}
        >
          {/* Header */}
          <View style={tw`border-b border-strokecream px-6 py-5`}>
            <View style={tw`flex-row items-center justify-between`}>
              <View style={tw`flex-1`}>
                <Text style={tw.style(h6TextStyle, 'text-eggplant')}>
                  Need to Restock?
                </Text>
                {recipeName && (
                  <Text style={tw.style(bodyMediumRegular, 'text-stone mt-1')}>
                    {recipeName}
                  </Text>
                )}
              </View>
              <Pressable onPress={handleSkip} style={tw`ml-2 p-2`}>
                <Ionicons name="close" size={24} color={tw.color('stone')} />
              </Pressable>
            </View>
          </View>

          {/* Content */}
          <ScrollView style={tw`max-h-[400px]`} showsVerticalScrollIndicator={false}>
            <View style={tw`px-6 py-4`}>
              <Text style={tw.style(bodyMediumRegular, 'text-stone mb-4')}>
                Select any ingredients you've run out of to add them to your shopping list:
              </Text>

              {uniqueIngredients.map((ingredient) => {
                const isSelected = selectedIngredients.has(ingredient.id);
                return (
                  <Pressable
                    key={ingredient.id}
                    onPress={() => toggleIngredient(ingredient.id)}
                    style={tw.style(
                      'flex-row items-start mb-3 p-3 rounded-2lg border',
                      isSelected ? 'bg-eggplant-light bg-opacity-10 border-eggplant' : 'bg-white border-strokecream'
                    )}
                  >
                    {/* Checkbox */}
                    <View
                      style={tw.style(
                        'h-6 w-6 rounded-md border-2 items-center justify-center mr-3 mt-0.5',
                        isSelected ? 'bg-eggplant border-eggplant' : 'border-stone'
                      )}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </View>

                    {/* Ingredient Info */}
                    <View style={tw`flex-1`}>
                      <Text style={tw.style(bodyMediumBold, isSelected && 'text-eggplant')}>
                        {ingredient.title}
                      </Text>
                      <Text style={tw.style(bodyMediumRegular, 'text-stone mt-0.5')}>
                        {ingredient.quantity}
                        {ingredient.preparation && ` • ${ingredient.preparation}`}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {/* Success Message */}
          {successMessage && (
            <View style={tw`absolute inset-0 bg-white bg-opacity-95 items-center justify-center rounded-2lg`}>
              <View style={tw`items-center`}>
                <View style={tw`h-20 w-20 rounded-full bg-kale items-center justify-center mb-4`}>
                  <Ionicons name="checkmark" size={40} color="white" />
                </View>
                <Text style={tw.style(h6TextStyle, 'text-eggplant text-center')}>
                  Added to Shopping List!
                </Text>
                <Text style={tw.style(bodyMediumRegular, 'text-stone text-center mt-2')}>
                  {selectedIngredients.size} item{selectedIngredients.size > 1 ? 's' : ''} added
                </Text>
              </View>
            </View>
          )}

          {/* Footer */}
          <View style={tw`px-6 pb-6 gap-3`}>
            {selectedIngredients.size > 0 && (
              <View style={tw`bg-eggplant bg-opacity-10 rounded-xl px-4 py-2 mb-2`}>
                <Text style={tw.style(bodySmallRegular, 'text-eggplant text-center')}>
                  {selectedIngredients.size} ingredient{selectedIngredients.size > 1 ? 's' : ''} selected
                </Text>
              </View>
            )}

            <Pressable
              onPress={handleAddToShoppingList}
              disabled={loading || selectedIngredients.size === 0}
              style={tw.style(
                'bg-eggplant rounded-2lg py-4 items-center',
                (loading || selectedIngredients.size === 0) && 'opacity-50'
              )}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <View style={tw`flex-row items-center`}>
                  <Ionicons name="cart" size={20} color="white" style={tw`mr-2`} />
                  <Text style={tw.style(bodyMediumBold, 'text-white')}>
                    Add to Shopping List
                  </Text>
                </View>
              )}
            </Pressable>

            <Pressable
              onPress={handleSkip}
              disabled={loading}
              style={tw`border-2 border-strokecream rounded-2lg py-4 items-center`}
            >
              <Text style={tw.style(bodyMediumBold, 'text-stone')}>
                Skip for Now
              </Text>
            </Pressable>
          </View>
        </Animatable.View>
      </View>
    </Modal>
  );
}
