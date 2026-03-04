import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import tw from '../../../common/tailwind';
import { bodyMediumRegular, bodyMediumBold } from '../../../theme/typography';
import { useAddShoppingListItemMutation } from '../api/shoppingListApi';
import { useGetAllIngredientsQuery } from '../../ingredients/api/ingredientsApi';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
  isSpeechRecognitionAvailable,
} from '../../inventory/utils/speechRecognition';

const COMMON_UNITS = ['piece', 'kg', 'g', 'litre', 'ml', 'bunch', 'pack', 'cup', 'tbsp', 'tsp', 'dozen'];

interface AddManualItemModalProps {
  isVisible: boolean;
  startListeningOnOpen?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddManualItemModal({
  isVisible,
  startListeningOnOpen = false,
  onClose,
  onSuccess,
}: AddManualItemModalProps) {
  const [addItem, { isLoading: loading }] = useAddShoppingListItemMutation();
  const { data: allIngredients } = useGetAllIngredientsQuery(undefined);

  const [searchText, setSearchText] = useState('');
  const [selectedIngredientId, setSelectedIngredientId] = useState<string | undefined>();
  const [ingredientName, setIngredientName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('piece');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const finalTranscriptRef = useRef('');

  useSpeechRecognitionEvent('result', (event) => {
    const latest = event.results?.[0]?.transcript || '';
    if (!latest) return;

    if (event.isFinal) {
      finalTranscriptRef.current = latest;
      setIngredientName(latest);
      setSearchText(latest);
      setSelectedIngredientId(undefined);
    } else {
      const interimText = latest;
      setIngredientName(interimText);
      setSearchText(interimText);
      setSelectedIngredientId(undefined);
    }
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
  });

  useSpeechRecognitionEvent('error', () => {
    setIsListening(false);
  });

  // Filter ingredients for autocomplete
  const filteredIngredients =
    searchText.length >= 2 && !selectedIngredientId
      ? (allIngredients || [])
          .filter((i) => i.name.toLowerCase().includes(searchText.toLowerCase()))
          .slice(0, 8)
      : [];

  const handleAdd = async () => {
    setErrorMessage('');
    if (!ingredientName.trim()) {
      setErrorMessage('Please enter an ingredient name');
      return;
    }
    if (!quantity.trim()) {
      setErrorMessage('Please enter a quantity (e.g. 1, 500, 2)');
      return;
    }

    try {
      await addItem({
        ingredientId: selectedIngredientId,
        ingredientName: selectedIngredientId ? undefined : ingredientName.trim(),
        quantity: quantity.trim(),
        unit: unit || undefined,
        notes: notes.trim() || undefined,
        source: 'MANUAL',
      }).unwrap();

      resetForm();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error adding item:', error);
      const apiMessages = error?.data?.message;
      if (Array.isArray(apiMessages) && apiMessages.length > 0) {
        setErrorMessage(apiMessages.join('\n'));
      } else if (typeof apiMessages === 'string') {
        setErrorMessage(apiMessages);
      } else {
        setErrorMessage('Failed to add item. Please try again.');
      }
    }
  };

  const stopListening = useCallback(() => {
    setIsListening(false);
    if (ExpoSpeechRecognitionModule) {
      ExpoSpeechRecognitionModule.stop();
    }
  }, []);

  const startListening = useCallback(async () => {
    if (!isSpeechRecognitionAvailable || !ExpoSpeechRecognitionModule) {
      Alert.alert('Voice unavailable', 'Voice input requires a development build.');
      return;
    }

    try {
      const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission Required', 'Microphone permission is needed for voice input.');
        return;
      }

      finalTranscriptRef.current = '';
      setIsListening(true);
      setSelectedIngredientId(undefined);

      ExpoSpeechRecognitionModule.start({
        lang: 'en-IN',
        interimResults: true,
        continuous: false,
      });
    } catch (error) {
      setIsListening(false);
      Alert.alert('Error', 'Unable to start voice input on this device.');
    }
  }, []);

  const resetForm = () => {
    setSearchText('');
    setSelectedIngredientId(undefined);
    setIngredientName('');
    setQuantity('');
    setUnit('piece');
    setNotes('');
    setErrorMessage('');
    finalTranscriptRef.current = '';
    stopListening();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (!isVisible && isListening) {
      stopListening();
    }
  }, [isVisible, isListening, stopListening]);

  useEffect(() => {
    if (isVisible && startListeningOnOpen && !isListening) {
      startListening();
    }
  }, [isVisible, startListeningOnOpen, isListening, startListening]);

  const isValid = ingredientName.trim().length > 0 && quantity.trim().length > 0;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={tw`flex-1`}>
        {/* Backdrop */}
        <Pressable onPress={handleClose} style={tw`flex-1 bg-black/40`} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Animatable.View
            animation="slideInUp"
            duration={250}
            useNativeDriver
            style={[
              tw`bg-white rounded-t-3xl px-5 pt-5 pb-8`,
              { maxHeight: Dimensions.get('window').height * 0.85 },
            ]}
          >
            {/* Handle bar */}
            <View style={tw`w-10 h-1 rounded-full bg-gray-200 self-center mb-4`} />

            {/* Header */}
            <View style={tw`flex-row items-center justify-between mb-5`}>
              <View style={tw`flex-1`}>
                <Text style={tw.style(bodyMediumBold, 'text-gray-900 text-lg')}>
                  Add to Shopping List
                </Text>
                <Text style={tw.style(bodyMediumRegular, 'text-gray-500 text-xs mt-0.5')}>
                  Search from existing ingredients or type a new one
                </Text>
              </View>
              <Pressable
                onPress={handleClose}
                style={tw`w-9 h-9 rounded-full bg-gray-100 items-center justify-center ml-3`}
              >
                <Ionicons name="close" size={20} color="#6B7280" />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={tw`flex-shrink`}
              keyboardShouldPersistTaps="handled"
            >
              {/* Ingredient Search */}
              <View style={tw`mb-4`}>
                <Text style={tw`text-xs text-gray-500 mb-1.5 font-medium`}>
                  Ingredient *
                </Text>
                <View
                  style={tw.style(
                    'flex-row items-center rounded-xl px-4 py-3',
                    selectedIngredientId
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-gray-50',
                  )}
                >
                  <Ionicons
                    name={selectedIngredientId ? 'nutrition' : 'search-outline'}
                    size={18}
                    color={selectedIngredientId ? '#16A34A' : '#9CA3AF'}
                    style={tw`mr-2`}
                  />
                  <TextInput
                    value={ingredientName}
                    onChangeText={(text) => {
                      setSearchText(text);
                      setIngredientName(text);
                      setSelectedIngredientId(undefined);
                    }}
                    placeholder="Search: Tomato, Paneer, Rice..."
                    placeholderTextColor="#9CA3AF"
                    style={tw.style(bodyMediumRegular, 'flex-1 text-gray-800')}
                    autoCapitalize="words"
                  />
                  <Pressable
                    onPress={isListening ? stopListening : startListening}
                    style={tw.style(
                      'w-8 h-8 rounded-full items-center justify-center ml-2',
                      isListening ? 'bg-red-100' : 'bg-purple-100',
                    )}
                    accessibilityRole="button"
                    accessibilityLabel={isListening ? 'Stop voice input' : 'Start voice input'}
                  >
                    <Ionicons
                      name={isListening ? 'stop' : 'mic'}
                      size={16}
                      color={isListening ? '#EF4444' : '#7C3AED'}
                    />
                  </Pressable>
                  {selectedIngredientId && (
                    <Pressable
                      onPress={() => {
                        setSelectedIngredientId(undefined);
                        setIngredientName('');
                        setSearchText('');
                      }}
                    >
                      <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                    </Pressable>
                  )}
                </View>
                <Text style={tw.style(bodyMediumRegular, 'text-gray-400 text-xs mt-1')}>
                  {isListening ? 'Listening… tap stop when done' : 'Tap mic to speak ingredient name'}
                </Text>

                {/* Autocomplete dropdown */}
                {filteredIngredients.length > 0 && (
                  <View style={tw`bg-white border border-gray-200 rounded-xl mt-1`}>
                    <ScrollView
                      nestedScrollEnabled
                      showsVerticalScrollIndicator={false}
                      style={tw`max-h-44`}
                    >
                      {filteredIngredients.map((ing) => (
                        <Pressable
                          key={ing._id}
                          onPress={() => {
                            setIngredientName(ing.name);
                            setSearchText(ing.name);
                            setSelectedIngredientId(ing._id);
                          }}
                          style={tw`px-4 py-3 border-b border-gray-50 flex-row items-center`}
                        >
                          <View
                            style={tw`w-7 h-7 rounded-full bg-green-50 items-center justify-center mr-3`}
                          >
                            <Ionicons name="nutrition-outline" size={14} color="#16A34A" />
                          </View>
                          <Text style={tw.style(bodyMediumRegular, 'text-gray-700 flex-1')}>
                            {ing.name}
                          </Text>
                          <Ionicons name="add-circle-outline" size={18} color="#9CA3AF" />
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* DB linked badge */}
                {selectedIngredientId && (
                  <View style={tw`flex-row items-center mt-1.5`}>
                    <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                    <Text style={tw`text-green-600 text-xs ml-1`}>
                      Linked to ingredient database
                    </Text>
                  </View>
                )}
              </View>

              {/* Quantity */}
              <View style={tw`mb-4`}>
                <Text style={tw`text-xs text-gray-500 mb-1.5 font-medium`}>
                  Quantity *
                </Text>
                <TextInput
                  value={quantity}
                  onChangeText={setQuantity}
                  placeholder="e.g. 500, 2, 1.5"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="default"
                  style={tw.style(
                    bodyMediumRegular,
                    'bg-gray-50 rounded-xl px-4 py-3 text-gray-800',
                  )}
                />
              </View>

              {/* Unit Chips */}
              <View style={tw`mb-4`}>
                <Text style={tw`text-xs text-gray-500 mb-1.5 font-medium`}>Unit</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={tw`flex-row gap-2 py-1`}>
                    {COMMON_UNITS.map((u) => (
                      <Pressable
                        key={u}
                        onPress={() => setUnit(u === unit ? '' : u)}
                        style={tw.style(
                          'px-3.5 py-2 rounded-lg',
                          unit === u ? 'bg-eggplant' : 'bg-gray-100',
                        )}
                      >
                        <Text
                          style={tw.style(
                            'text-xs',
                            unit === u ? 'text-white font-semibold' : 'text-gray-600',
                          )}
                        >
                          {u}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Notes */}
              <View style={tw`mb-4`}>
                <Text style={tw`text-xs text-gray-500 mb-1.5 font-medium`}>
                  Notes (Optional)
                </Text>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="e.g. organic, ripe, no brand preference"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={2}
                  style={tw.style(
                    bodyMediumRegular,
                    'bg-gray-50 rounded-xl px-4 py-3 text-gray-800',
                  )}
                />
              </View>

              {/* Error */}
              {errorMessage ? (
                <View
                  style={tw`bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex-row items-center mb-4`}
                >
                  <Ionicons name="alert-circle" size={18} color="#EF4444" style={tw`mr-2`} />
                  <Text style={tw.style(bodyMediumRegular, 'text-red-600 flex-1')}>
                    {errorMessage}
                  </Text>
                </View>
              ) : null}

              {/* Add Button */}
              <Pressable
                onPress={handleAdd}
                disabled={loading || !isValid}
                style={tw.style(
                  'rounded-full py-4 items-center mb-3',
                  loading || !isValid ? 'bg-gray-200' : 'bg-eggplant',
                )}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <View style={tw`flex-row items-center`}>
                    <Ionicons
                      name="cart-outline"
                      size={20}
                      color={!isValid ? '#9CA3AF' : 'white'}
                      style={tw`mr-2`}
                    />
                    <Text
                      style={tw.style(
                        bodyMediumBold,
                        !isValid ? 'text-gray-400' : 'text-white',
                      )}
                    >
                      Add to Shopping List
                    </Text>
                  </View>
                )}
              </Pressable>
            </ScrollView>
          </Animatable.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
