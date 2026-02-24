import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import tw from '../../../common/tailwind';
import {
  bodyMediumRegular,
  bodyMediumBold,
} from '../../../theme/typography';
import { useAddInventoryItemMutation } from '../api/inventoryApi';
import { useGetAllIngredientsQuery } from '../../ingredients/api/ingredientsApi';
import { StorageLocation, AddInventoryItemDto } from '../api/types';

const STORAGE_OPTIONS: { key: StorageLocation; label: string; icon: string }[] = [
  { key: StorageLocation.FRIDGE, label: 'Fridge', icon: 'snow-outline' },
  { key: StorageLocation.FREEZER, label: 'Freezer', icon: 'cube-outline' },
  { key: StorageLocation.PANTRY, label: 'Pantry', icon: 'file-tray-stacked-outline' },
  { key: StorageLocation.OTHER, label: 'Other', icon: 'ellipsis-horizontal-outline' },
];

const COMMON_UNITS = ['kg', 'g', 'litre', 'ml', 'piece', 'bunch', 'pack', 'dozen', 'cup', 'tbsp', 'tsp'];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function AddInventoryItemModal({ visible, onClose }: Props) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('piece');
  const [storage, setStorage] = useState<StorageLocation>(StorageLocation.FRIDGE);
  const [expiryDays, setExpiryDays] = useState('7');
  const [isStaple, setIsStaple] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedIngredientId, setSelectedIngredientId] = useState<string | undefined>();

  const [addItem, { isLoading }] = useAddInventoryItemMutation();
  const { data: allIngredients } = useGetAllIngredientsQuery(undefined);

  // Filter ingredients for autocomplete
  const filteredIngredients =
    searchText.length >= 2
      ? (allIngredients || [])
          .filter((i) =>
            i.name.toLowerCase().includes(searchText.toLowerCase()),
          )
          .slice(0, 8)
      : [];

  const resetForm = () => {
    setName('');
    setQuantity('');
    setUnit('piece');
    setStorage(StorageLocation.FRIDGE);
    setExpiryDays('7');
    setIsStaple(false);
    setSearchText('');
    setSelectedIngredientId(undefined);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (parseInt(expiryDays) || 7));

    const dto: AddInventoryItemDto = {
      name: name.trim(),
      quantity: parseFloat(quantity) || 1,
      unit,
      storageLocation: storage,
      expiresAt: expiresAt.toISOString(),
      isStaple,
      ingredientId: selectedIngredientId,
    };

    try {
      await addItem(dto).unwrap();
      resetForm();
      onClose();
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={tw`flex-1`}>
        <Pressable
          onPress={onClose}
          style={tw`flex-1 bg-black/40`}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Animatable.View
            animation="slideInUp"
            duration={250}
            style={[tw`bg-white rounded-t-3xl px-5 pt-5 pb-8`, { maxHeight: Dimensions.get('window').height * 0.85 }]}
          >
              {/* Header */}
              <View style={tw`flex-row items-center justify-between mb-4`}>
                <Text style={tw.style(bodyMediumBold, 'text-gray-900 text-lg')}>
                  Add Item
                </Text>
                <Pressable onPress={onClose}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={tw`flex-shrink`}>
                {/* Name Input with Autocomplete */}
                <View style={tw`mb-3`}>
                  <Text style={tw`text-xs text-gray-500 mb-1`}>
                    Ingredient Name *
                  </Text>
                  <TextInput
                    value={name || searchText}
                    onChangeText={(text) => {
                      setSearchText(text);
                      setName(text);
                      setSelectedIngredientId(undefined);
                    }}
                    placeholder="e.g. Tomato, Paneer, Rice..."
                    placeholderTextColor="#9CA3AF"
                    style={tw.style(
                      bodyMediumRegular,
                      'bg-gray-50 rounded-xl px-4 py-3 text-gray-800',
                    )}
                  />
                  {/* Autocomplete dropdown */}
                  {filteredIngredients.length > 0 && !selectedIngredientId && (
                    <View style={tw`bg-white border border-gray-200 rounded-xl mt-1 max-h-40`}>
                      <ScrollView nestedScrollEnabled>
                        {filteredIngredients.map((ing) => (
                          <Pressable
                            key={ing._id}
                            onPress={() => {
                              setName(ing.name);
                              setSearchText(ing.name);
                              setSelectedIngredientId(ing._id);
                            }}
                            style={tw`px-4 py-2.5 border-b border-gray-50 flex-row items-center`}
                          >
                            <Ionicons
                              name="nutrition-outline"
                              size={16}
                              color="#16A34A"
                            />
                            <Text
                              style={tw.style(
                                bodyMediumRegular,
                                'text-gray-700 ml-2',
                              )}
                            >
                              {ing.name}
                            </Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {/* Quantity + Unit */}
                <View style={tw`flex-row gap-2 mb-3`}>
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-xs text-gray-500 mb-1`}>Quantity</Text>
                    <TextInput
                      value={quantity}
                      onChangeText={setQuantity}
                      keyboardType="decimal-pad"
                      placeholder="1"
                      placeholderTextColor="#9CA3AF"
                      style={tw.style(
                        bodyMediumRegular,
                        'bg-gray-50 rounded-xl px-4 py-3 text-gray-800',
                      )}
                    />
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-xs text-gray-500 mb-1`}>Unit</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={tw`flex-row gap-1 py-1`}>
                        {COMMON_UNITS.map((u) => (
                          <Pressable
                            key={u}
                            onPress={() => setUnit(u)}
                            style={tw.style(
                              'px-3 py-2 rounded-lg',
                              unit === u
                                ? 'bg-green-600'
                                : 'bg-gray-100',
                            )}
                          >
                            <Text
                              style={tw.style(
                                'text-xs',
                                unit === u ? 'text-white' : 'text-gray-600',
                              )}
                            >
                              {u}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                </View>

                {/* Storage Location */}
                <View style={tw`mb-3`}>
                  <Text style={tw`text-xs text-gray-500 mb-1`}>
                    Storage Location
                  </Text>
                  <View style={tw`flex-row gap-2`}>
                    {STORAGE_OPTIONS.map((opt) => (
                      <Pressable
                        key={opt.key}
                        onPress={() => setStorage(opt.key)}
                        style={tw.style(
                          'flex-1 p-3 rounded-xl items-center',
                          storage === opt.key
                            ? 'bg-green-600'
                            : 'bg-gray-50 border border-gray-200',
                        )}
                      >
                        <Ionicons
                          name={opt.icon as any}
                          size={20}
                          color={storage === opt.key ? 'white' : '#6B7280'}
                        />
                        <Text
                          style={tw.style(
                            'text-xs mt-1',
                            storage === opt.key
                              ? 'text-white'
                              : 'text-gray-600',
                          )}
                        >
                          {opt.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Expiry */}
                <View style={tw`mb-3`}>
                  <Text style={tw`text-xs text-gray-500 mb-1`}>
                    Expires in (days)
                  </Text>
                  <View style={tw`flex-row gap-2`}>
                    {['1', '3', '5', '7', '14', '30'].map((d) => (
                      <Pressable
                        key={d}
                        onPress={() => setExpiryDays(d)}
                        style={tw.style(
                          'flex-1 py-2 rounded-lg items-center',
                          expiryDays === d
                            ? 'bg-amber-500'
                            : 'bg-gray-100',
                        )}
                      >
                        <Text
                          style={tw.style(
                            'text-xs',
                            expiryDays === d ? 'text-white' : 'text-gray-600',
                          )}
                        >
                          {d}d
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Staple Toggle */}
                <Pressable
                  onPress={() => setIsStaple(!isStaple)}
                  style={tw`flex-row items-center gap-2 mb-4 py-2`}
                >
                  <Ionicons
                    name={isStaple ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={isStaple ? '#16A34A' : '#9CA3AF'}
                  />
                  <Text style={tw.style(bodyMediumRegular, 'text-gray-700')}>
                    Mark as staple item (auto-reorder when out)
                  </Text>
                </Pressable>

                {/* Submit */}
                <Pressable
                  onPress={handleSubmit}
                  disabled={isLoading || !name.trim()}
                  style={tw.style(
                    'rounded-xl py-3.5 items-center',
                    isLoading || !name.trim() ? 'bg-gray-200' : 'bg-green-600',
                  )}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text
                      style={tw.style(
                        bodyMediumBold,
                        !name.trim() ? 'text-gray-400' : 'text-white',
                      )}
                    >
                      Add to Kitchen
                    </Text>
                  )}
                </Pressable>
              </ScrollView>
          </Animatable.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
