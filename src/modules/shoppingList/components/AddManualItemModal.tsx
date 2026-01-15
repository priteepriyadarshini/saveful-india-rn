import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import tw from '../../../common/tailwind';
import { h6TextStyle, bodyMediumRegular, bodyMediumBold, bodySmallRegular } from '../../../theme/typography';
import { useAddShoppingListItemMutation } from '../api/shoppingListApi';

interface AddManualItemModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddManualItemModal({
  isVisible,
  onClose,
  onSuccess,
}: AddManualItemModalProps) {
  const [addItem, { isLoading: loading }] = useAddShoppingListItemMutation();
  const [ingredientName, setIngredientName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleAdd = async () => {
    setErrorMessage('');

    if (!ingredientName.trim()) {
      setErrorMessage('Please enter an ingredient name');
      return;
    }

    try {
      await addItem({
        ingredientName: ingredientName.trim(),
        quantity: quantity.trim() || undefined,
        unit: unit.trim() || undefined,
        notes: notes.trim() || undefined,
        source: 'MANUAL',
      }).unwrap();

      resetForm();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding item:', error);
      setErrorMessage('Failed to add item. Please try again.');
    }
  };

  const resetForm = () => {
    setIngredientName('');
    setQuantity('');
    setUnit('');
    setNotes('');
    setErrorMessage('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal animationType="fade" transparent visible={isVisible} onRequestClose={handleClose}>
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
              <Text style={tw.style(h6TextStyle, 'text-eggplant')}>Add to Shopping List</Text>
              <Pressable onPress={handleClose} style={tw`p-2`}>
                <Ionicons name="close" size={24} color={tw.color('stone')} />
              </Pressable>
            </View>
          </View>

          {/* Content */}
          <View style={tw`px-6 py-4`}>
            {/* Ingredient Name */}
            <View style={tw`mb-4`}>
              <Text style={tw.style(bodyMediumBold, 'mb-2')}>Ingredient Name *</Text>
              <TextInput
                style={tw.style(bodyMediumRegular, 'border-2 border-strokecream rounded-2lg px-4 py-3 bg-white text-black')}
                placeholder="e.g., Tomatoes, Onions, Rice"
                placeholderTextColor="#999"
                value={ingredientName}
                onChangeText={setIngredientName}
                autoCapitalize="words"
              />
            </View>

            {/* Quantity */}
            <View style={tw`mb-4`}>
              <Text style={tw.style(bodyMediumBold, 'mb-2')}>Quantity (Optional)</Text>
              <View style={tw`flex-row gap-2`}>
                <View style={tw`flex-1`}>
                  <TextInput
                    style={tw.style(bodyMediumRegular, 'border-2 border-strokecream rounded-2lg px-4 py-3 bg-white text-black')}
                    placeholder="e.g., 500"
                    placeholderTextColor="#999"
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="default"
                  />
                </View>
                <View style={tw`w-[100px]`}>
                  <TextInput
                    style={tw.style(bodyMediumRegular, 'border-2 border-strokecream rounded-2lg px-4 py-3 bg-white text-black')}
                    placeholder="Unit"
                    placeholderTextColor="#999"
                    value={unit}
                    onChangeText={setUnit}
                  />
                </View>
              </View>
              <Text style={tw.style(bodySmallRegular, 'text-stone mt-1')}>
                You can add quantity later from the shopping list
              </Text>
            </View>

            {/* Notes */}
            <View style={tw`mb-4`}>
              <Text style={tw.style(bodyMediumBold, 'mb-2')}>Notes (Optional)</Text>
              <TextInput
                style={tw.style(bodyMediumRegular, 'border-2 border-strokecream rounded-2lg px-4 py-3 bg-white text-black')}
                placeholder="e.g., organic, ripe"
                placeholderTextColor="#999"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Error Message */}
            {errorMessage && (
              <View style={tw`bg-validation bg-opacity-10 rounded-xl px-4 py-3 flex-row items-center mb-4`}>
                <Ionicons name="alert-circle" size={20} color={tw.color('validation')} style={tw`mr-2`} />
                <Text style={tw.style(bodyMediumRegular, 'text-validation flex-1')}>
                  {errorMessage}
                </Text>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={tw`px-6 pb-6 gap-3`}>
            <Pressable
              onPress={handleAdd}
              disabled={loading || !ingredientName.trim() || !quantity.trim()}
              style={tw.style(
                'bg-eggplant rounded-2lg py-4 items-center',
                (loading || !ingredientName.trim() || !quantity.trim()) && 'opacity-50'
              )}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={tw.style(bodyMediumBold, 'text-white')}>
                  Add to Shopping List
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={handleClose}
              disabled={loading}
              style={tw`border-2 border-strokecream rounded-2lg py-4 items-center`}
            >
              <Text style={tw.style(bodyMediumBold, 'text-stone')}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </Animatable.View>
      </View>
    </Modal>
  );
}
