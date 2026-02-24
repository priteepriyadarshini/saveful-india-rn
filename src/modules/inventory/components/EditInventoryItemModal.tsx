import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import tw from '../../../common/tailwind';
import {
  bodyMediumRegular,
  bodyMediumBold,
} from '../../../theme/typography';
import { useUpdateInventoryItemMutation } from '../api/inventoryApi';
import {
  StorageLocation,
  UpdateInventoryItemDto,
  InventoryItem,
} from '../api/types';

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
  item: InventoryItem | null;
}

export default function EditInventoryItemModal({ visible, onClose, item }: Props) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('piece');
  const [storage, setStorage] = useState<StorageLocation>(StorageLocation.FRIDGE);
  const [expiryDays, setExpiryDays] = useState('');
  const [isStaple, setIsStaple] = useState(false);

  const [updateItem, { isLoading }] = useUpdateInventoryItemMutation();

  useEffect(() => {
    if (item && visible) {
      setName(item.name);
      setQuantity(String(item.quantity));
      setUnit(item.unit);
      setStorage(item.storageLocation);
      setIsStaple(item.isStaple);

      if (item.expiresAt) {
        const now = new Date();
        const expires = new Date(item.expiresAt);
        const diffDays = Math.max(
          0,
          Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        );
        setExpiryDays(String(diffDays));
      } else {
        setExpiryDays('');
      }
    }
  }, [item, visible]);

  const handleSubmit = async () => {
    if (!item || !name.trim() || !quantity) return;

    const dto: UpdateInventoryItemDto = {
      name: name.trim(),
      quantity: parseFloat(quantity),
      unit,
      storageLocation: storage,
      isStaple,
    };

    if (expiryDays) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiryDays, 10));
      dto.expiresAt = expiresAt.toISOString();
    }

    try {
      await updateItem({ id: item._id, dto }).unwrap();
      onClose();
    } catch (err) {
      console.error('Failed to update item:', err);
    }
  };

  if (!item) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={tw`flex-1`}
      >
        <Pressable
          style={tw`flex-1 bg-black/50 justify-end`}
          onPress={onClose}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={tw`bg-white rounded-t-3xl max-h-[85%]`}
          >
            <Animatable.View animation="slideInUp" duration={300}>
              {/* Handle bar */}
              <View style={tw`items-center pt-3 pb-2`}>
                <View style={tw`w-10 h-1.2 bg-gray-300 rounded-full`} />
              </View>

              {/* Header */}
              <View style={tw`flex-row items-center justify-between px-5 pb-3`}>
                <Text style={tw.style(bodyMediumBold, 'text-gray-900 text-lg')}>
                  Edit Item
                </Text>
                <Pressable onPress={onClose} hitSlop={10}>
                  <Ionicons name="close-circle" size={28} color="#9CA3AF" />
                </Pressable>
              </View>

              <ScrollView
                style={tw`px-5`}
                contentContainerStyle={tw`pb-8`}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Name */}
                <View style={tw`mb-4`}>
                  <Text style={tw.style(bodyMediumRegular, 'text-sm text-gray-600 mb-1')}>
                    Item Name
                  </Text>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. Tomato, Milk"
                    style={tw.style(
                      bodyMediumRegular,
                      'bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900',
                    )}
                  />
                </View>

                {/* Quantity + Unit */}
                <View style={tw`flex-row gap-3 mb-4`}>
                  <View style={tw`flex-1`}>
                    <Text style={tw.style(bodyMediumRegular, 'text-sm text-gray-600 mb-1')}>
                      Quantity
                    </Text>
                    <TextInput
                      value={quantity}
                      onChangeText={setQuantity}
                      placeholder="0"
                      keyboardType="decimal-pad"
                      style={tw.style(
                        bodyMediumRegular,
                        'bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900',
                      )}
                    />
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={tw.style(bodyMediumRegular, 'text-sm text-gray-600 mb-1')}>
                      Unit
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={tw`gap-2 py-1`}
                    >
                      {COMMON_UNITS.map((u) => (
                        <Pressable
                          key={u}
                          onPress={() => setUnit(u)}
                          style={tw`px-3 py-2 rounded-lg ${
                            unit === u ? 'bg-emerald-500' : 'bg-gray-100'
                          }`}
                        >
                          <Text
                            style={tw.style(
                              bodyMediumRegular,
                              `text-xs ${unit === u ? 'text-white' : 'text-gray-600'}`,
                            )}
                          >
                            {u}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                </View>

                {/* Storage Location */}
                <View style={tw`mb-4`}>
                  <Text style={tw.style(bodyMediumRegular, 'text-sm text-gray-600 mb-2')}>
                    Storage Location
                  </Text>
                  <View style={tw`flex-row gap-2`}>
                    {STORAGE_OPTIONS.map((opt) => (
                      <Pressable
                        key={opt.key}
                        onPress={() => setStorage(opt.key)}
                        style={tw`flex-1 items-center py-3 rounded-xl border ${
                          storage === opt.key
                            ? 'bg-emerald-50 border-emerald-500'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <Ionicons
                          name={opt.icon as any}
                          size={20}
                          color={storage === opt.key ? '#10B981' : '#9CA3AF'}
                        />
                        <Text
                          style={tw.style(
                            bodyMediumRegular,
                            `text-xs mt-1 ${
                              storage === opt.key ? 'text-emerald-700' : 'text-gray-500'
                            }`,
                          )}
                        >
                          {opt.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Expiry */}
                <View style={tw`mb-4`}>
                  <Text style={tw.style(bodyMediumRegular, 'text-sm text-gray-600 mb-1')}>
                    Days Until Expiry
                  </Text>
                  <View style={tw`flex-row gap-2`}>
                    {['1', '3', '5', '7', '14', '30'].map((d) => (
                      <Pressable
                        key={d}
                        onPress={() => setExpiryDays(d)}
                        style={tw`px-3 py-2 rounded-lg ${
                          expiryDays === d ? 'bg-amber-500' : 'bg-gray-100'
                        }`}
                      >
                        <Text
                          style={tw.style(
                            bodyMediumRegular,
                            `text-xs ${expiryDays === d ? 'text-white' : 'text-gray-600'}`,
                          )}
                        >
                          {d}d
                        </Text>
                      </Pressable>
                    ))}
                    <TextInput
                      value={expiryDays}
                      onChangeText={setExpiryDays}
                      keyboardType="number-pad"
                      placeholder="Custom"
                      style={tw.style(
                        bodyMediumRegular,
                        'bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-16 text-center text-xs',
                      )}
                    />
                  </View>
                </View>

                {/* Is Staple */}
                <View style={tw`mb-5`}>
                  <Pressable
                    onPress={() => setIsStaple(!isStaple)}
                    style={tw`flex-row items-center gap-3 py-2`}
                  >
                    <View
                      style={tw`w-6 h-6 rounded-md border-2 items-center justify-center ${
                        isStaple ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'
                      }`}
                    >
                      {isStaple && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </View>
                    <View>
                      <Text style={tw.style(bodyMediumRegular, 'text-sm text-gray-800')}>
                        Mark as Staple
                      </Text>
                      <Text style={tw.style(bodyMediumRegular, 'text-xs text-gray-400')}>
                        Will alert when out of stock
                      </Text>
                    </View>
                  </Pressable>
                </View>

                {/* Submit */}
                <Pressable
                  onPress={handleSubmit}
                  disabled={isLoading || !name.trim() || !quantity}
                  style={tw`bg-emerald-500 py-4 rounded-2xl items-center ${
                    isLoading || !name.trim() || !quantity ? 'opacity-50' : ''
                  }`}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={tw.style(bodyMediumBold, 'text-white text-base')}>
                      Update Item
                    </Text>
                  )}
                </Pressable>
              </ScrollView>
            </Animatable.View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
