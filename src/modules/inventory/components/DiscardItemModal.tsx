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
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import tw from '../../../common/tailwind';
import {
  bodyMediumRegular,
  bodyMediumBold,
} from '../../../theme/typography';
import {
  useDiscardInventoryItemMutation,
  useClassifyWasteMutation,
} from '../api/inventoryApi';
import {
  InventoryItem,
  WasteType,
  DiscardReason,
  WasteClassification,
} from '../api/types';

const WASTE_OPTIONS: {
  key: WasteType;
  label: string;
  icon: string;
  color: string;
  desc: string;
}[] = [
  {
    key: WasteType.WET,
    label: 'Wet/Organic',
    icon: 'leaf-outline',
    color: '#22C55E',
    desc: 'Organic waste\ngreen bin',
  },
  {
    key: WasteType.DRY,
    label: 'Dry',
    icon: 'cube-outline',
    color: '#3B82F6',
    desc: 'Recyclable\nblue bin',
  },
  {
    key: WasteType.HAZARDOUS,
    label: 'Hazardous',
    icon: 'warning-outline',
    color: '#F59E0B',
    desc: 'Special\ndisposal',
  },
];

const REASON_OPTIONS: { key: DiscardReason; label: string; icon: string }[] = [
  { key: DiscardReason.EXPIRED, label: 'Expired', icon: 'time-outline' },
  { key: DiscardReason.SPOILED, label: 'Spoiled', icon: 'sad-outline' },
  { key: DiscardReason.LEFTOVER, label: 'Leftover', icon: 'restaurant-outline' },
  { key: DiscardReason.UNUSED, label: 'Unused', icon: 'close-circle-outline' },
  { key: DiscardReason.COOKED, label: 'Cooked', icon: 'flame-outline' },
];

interface Props {
  visible: boolean;
  item: InventoryItem;
  onClose: () => void;
}

const FRUIT_VEG_KEYWORDS = [
  'vegetable', 'fruit', 'tomato', 'onion', 'potato', 'carrot',
  'spinach', 'cabbage', 'cauliflower', 'banana', 'apple', 'mango',
  'orange', 'lemon', 'cucumber', 'brinjal', 'okra', 'beans', 'peas',
  'capsicum', 'zucchini', 'avocado', 'pear', 'peach', 'berry',
  'berries', 'grape', 'kiwi', 'pineapple', 'melon', 'lettuce',
  'celery', 'broccoli', 'mushroom', 'corn', 'beetroot', 'pumpkin',
  'sweet potato', 'eggplant', 'asparagus', 'sprouts',
];

function isFruitOrVeg(name: string): boolean {
  const lower = name.toLowerCase();
  return FRUIT_VEG_KEYWORDS.some((kw) => lower.includes(kw));
}

export default function DiscardItemModal({ visible, item, onClose }: Props) {
  const [reason, setReason] = useState<DiscardReason>(DiscardReason.EXPIRED);
  const [wasteType, setWasteType] = useState<WasteType>(WasteType.WET);
  const [notes, setNotes] = useState('');
  const [discardAll, setDiscardAll] = useState(true);
  const [partialQuantity, setPartialQuantity] = useState('');
  const [addToShoppingList, setAddToShoppingList] = useState(true);
  const [aiClassification, setAiClassification] = useState<WasteClassification | null>(null);

  const [discardItem, { isLoading }] = useDiscardInventoryItemMutation();
  const [classifyWaste, { isLoading: isClassifying }] = useClassifyWasteMutation();

  useEffect(() => {
    if (visible && item?.name) {
      classifyWaste({ ingredientName: item.name })
        .unwrap()
        .then((result) => {
          setAiClassification(result);
          setWasteType(result.wasteType);
        })
        .catch(() => {});
    }
  }, [visible, item?.name]);

  const handleDiscard = async () => {
    try {
      await discardItem({
        itemId: item._id,
        reason,
        wasteType,
        discardedQuantity: discardAll
          ? undefined
          : parseFloat(partialQuantity) || undefined,
        notes: notes.trim() || undefined,
        addToShoppingList,
      }).unwrap();
      onClose();
    } catch (error) {
      console.error('Failed to discard:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={tw`flex-1`}
      >
        <Pressable
          onPress={onClose}
          style={tw`flex-1 bg-black/40 justify-end`}
        >
          <Pressable onPress={() => {}}>
            <Animatable.View
              animation="slideInUp"
              duration={300}
              style={[tw`bg-white rounded-t-3xl px-5 pt-5`, { maxHeight: Dimensions.get('window').height * 0.92 }]}
            >
              {/* Header */}
              <View style={tw`flex-row items-center justify-between mb-4`}>
                <View>
                  <Text style={tw.style(bodyMediumBold, 'text-gray-900 text-lg')}>
                    Throw Out Item
                  </Text>
                  <Text style={tw.style(bodyMediumRegular, 'text-gray-500 text-sm')}>
                    {item.name} - {item.quantity} {item.unit}
                  </Text>
                </View>
                <Pressable onPress={onClose}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </Pressable>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={tw`pb-8`}
              >

              {/* Saveful AI Suggestion */}
              {aiClassification && (
                <View style={tw`bg-purple-50 rounded-xl p-3 mb-4 flex-row items-start gap-2`}>
                  <Ionicons name="sparkles" size={16} color="#7C3AED" />
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-xs text-purple-700 font-medium`}>
                      Saveful AI - {WASTE_OPTIONS.find((w) => w.key === aiClassification.wasteType)?.label} waste
                    </Text>
                    <Text style={tw`text-xs text-purple-600 mt-0.5`}>
                      {aiClassification.disposalTip}
                    </Text>
                  </View>
                </View>
              )}

              {/* Fruit & Veg Edible Nudge */}
              {isFruitOrVeg(item.name) && (
                <View style={tw`bg-green-50 rounded-xl p-3 mb-4 flex-row items-start gap-2`}>
                  <Text style={{ fontSize: 18 }}>😉</Text>
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-xs text-green-800 font-semibold`}>
                      A little soft doesn't mean it's done
                    </Text>
                    <Text style={tw`text-xs text-green-700 mt-0.5`}>
                      Spots? Wilted? Overripe? Could it be tomorrow's soup, smoothie or stir-fry instead?
                    </Text>
                  </View>
                </View>
              )}

              {/* Reason */}
              <Text style={tw`text-xs text-gray-500 mb-1.5`}>
                Why are you throwing this out?
              </Text>
              <View style={tw`flex-row flex-wrap gap-2 mb-4`}>
                {REASON_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.key}
                    onPress={() => setReason(opt.key)}
                    style={[
                      tw.style(
                        'flex-row items-center rounded-full',
                        reason === opt.key ? 'bg-amber-500' : 'bg-gray-100',
                      ),
                      { paddingHorizontal: 10, paddingVertical: 7, flexShrink: 0 },
                    ]}
                  >
                    <Ionicons
                      name={opt.icon as any}
                      size={13}
                      color={reason === opt.key ? 'white' : '#6B7280'}
                    />
                    <Text
                      style={[
                        tw.style('text-xs', reason === opt.key ? 'text-white' : 'text-gray-600'),
                        { marginLeft: 4 },
                      ]}
                      numberOfLines={1}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Waste Type */}
              <Text style={tw`text-xs text-gray-500 mb-1.5`}>
                Waste type
                {isClassifying && (
                  <Text style={tw`text-purple-500`}> · Saveful AI analysing...</Text>
                )}
              </Text>
              <View style={tw`flex-row gap-2 mb-4`}>
                {WASTE_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.key}
                    onPress={() => setWasteType(opt.key)}
                    style={[
                      tw.style(
                        'flex-1 rounded-xl items-center border',
                        wasteType === opt.key ? 'border-2' : 'border-gray-200',
                      ),
                      {
                        paddingVertical: 10,
                        paddingHorizontal: 4,
                        ...(wasteType === opt.key && {
                          borderColor: opt.color,
                          backgroundColor: opt.color + '15',
                        }),
                      },
                    ]}
                  >
                    <Ionicons
                      name={opt.icon as any}
                      size={20}
                      color={wasteType === opt.key ? opt.color : '#9CA3AF'}
                    />
                    <Text
                      style={[
                        tw`text-center mt-1`,
                        { fontSize: 11, fontWeight: '600', color: wasteType === opt.key ? opt.color : '#6B7280' },
                      ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {opt.label}
                    </Text>
                    <Text
                      style={[
                        tw`text-center mt-0.5`,
                        { fontSize: 9, color: wasteType === opt.key ? opt.color : '#9CA3AF' },
                      ]}
                      numberOfLines={2}
                    >
                      {opt.desc}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={tw`flex-row gap-2 mb-3`}>
                <Pressable
                  onPress={() => setDiscardAll(true)}
                  style={tw.style(
                    'flex-1 py-2.5 rounded-xl items-center',
                    discardAll ? 'bg-eggplant' : 'bg-gray-100',
                  )}
                >
                  <Text
                    style={tw.style(
                      'text-sm font-medium',
                      discardAll ? 'text-white' : 'text-gray-600',
                    )}
                    numberOfLines={1}
                  >
                    Throw Out All
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setDiscardAll(false)}
                  style={tw.style(
                    'flex-1 py-2.5 rounded-xl items-center',
                    !discardAll ? 'bg-amber-500' : 'bg-gray-100',
                  )}
                >
                  <Text
                    style={tw.style(
                      'text-sm font-medium',
                      !discardAll ? 'text-white' : 'text-gray-600',
                    )}
                    numberOfLines={1}
                  >
                    Partial
                  </Text>
                </Pressable>
              </View>

              {/* Partial Quantity */}
              {!discardAll && (
                <View style={tw`mb-3`}>
                  <Text style={tw`text-xs text-gray-500 mb-1`}>
                    How much to throw out? (out of {item.quantity} {item.unit})
                  </Text>
                  <TextInput
                    value={partialQuantity}
                    onChangeText={setPartialQuantity}
                    keyboardType="decimal-pad"
                    placeholder={`Max: ${item.quantity}`}
                    placeholderTextColor="#9CA3AF"
                    style={tw.style(
                      bodyMediumRegular,
                      'bg-gray-50 rounded-xl px-4 py-3 text-gray-800',
                    )}
                  />
                </View>
              )}

              {/* Notes */}
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Optional notes..."
                placeholderTextColor="#9CA3AF"
                style={tw.style(
                  bodyMediumRegular,
                  'bg-gray-50 rounded-xl px-4 py-3 text-gray-800 mb-3',
                )}
              />

              {/* Auto Shopping List Toggle */}
              <Pressable
                onPress={() => setAddToShoppingList(!addToShoppingList)}
                style={tw`flex-row items-center gap-2 mb-4 py-1`}
              >
                <Ionicons
                  name={addToShoppingList ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={addToShoppingList ? '#16A34A' : '#9CA3AF'}
                />
                <Text style={tw.style(bodyMediumRegular, 'text-gray-700')}>
                  Add replacement to shopping list
                </Text>
              </Pressable>

              {/* Submit */}
              <Pressable
                onPress={handleDiscard}
                disabled={isLoading}
                style={tw.style(
                  'rounded-xl py-3.5 items-center',
                  isLoading ? 'bg-gray-200' : 'bg-eggplant',
                )}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={tw.style(bodyMediumBold, 'text-white')}>
                    Throw Out Item
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
