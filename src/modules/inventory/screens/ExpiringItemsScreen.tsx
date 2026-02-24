import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import tw from '../../../common/tailwind';
import { useNavigation } from '@react-navigation/native';
import {
  bodyMediumRegular,
  bodyMediumBold,
  h6TextStyle,
} from '../../../theme/typography';
import { useGetExpiringItemsQuery } from '../api/inventoryApi';
import { InventoryItem, FreshnessStatus } from '../api/types';
import DiscardItemModal from '../components/DiscardItemModal';

export default function ExpiringItemsScreen() {
  const navigation = useNavigation<any>();
  const [days, setDays] = useState(3);
  const [discardItem, setDiscardItem] = useState<InventoryItem | null>(null);

  const { data: items, isLoading, isError, refetch } = useGetExpiringItemsQuery(days);

  const DAY_OPTIONS = [1, 3, 5, 7];

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
      {/* Header */}
      <View style={tw`px-5 pt-3 pb-2 flex-row items-center`}>
        <Pressable onPress={() => navigation.goBack()} style={tw`mr-3`}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </Pressable>
        <View style={tw`flex-1`}>
          <Text style={tw.style(h6TextStyle, 'text-gray-900')}>
            Expiring Soon
          </Text>
          <Text style={tw.style(bodyMediumRegular, 'text-gray-500 text-xs')}>
            Items that need your attention
          </Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate('InventoryMealSuggestions')}
          style={tw`bg-orange-50 px-3 py-1.5 rounded-full flex-row items-center gap-1`}
        >
          <Ionicons name="restaurant-outline" size={14} color="#EA580C" />
          <Text style={tw`text-xs text-orange-700 font-medium`}>
            Cook these
          </Text>
        </Pressable>
      </View>

      {/* Day Filter */}
      <View style={tw`px-5 py-3 flex-row gap-2`}>
        {DAY_OPTIONS.map((d) => (
          <Pressable
            key={d}
            onPress={() => setDays(d)}
            style={tw.style(
              'px-4 py-2 rounded-full',
              days === d ? 'bg-amber-500' : 'bg-gray-100',
            )}
          >
            <Text
              style={tw.style(
                bodyMediumRegular,
                days === d ? 'text-white' : 'text-gray-600',
                'text-sm',
              )}
            >
              {d === 1 ? 'Today' : `${d} days`}
            </Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color="#F59E0B" />
        </View>
      ) : isError ? (
        <View style={tw`flex-1 items-center justify-center px-5`}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={tw.style(bodyMediumRegular, 'text-red-500 mt-2')}>
            Failed to load
          </Text>
          <Pressable
            onPress={() => refetch()}
            style={tw`mt-3 bg-amber-500 px-6 py-2 rounded-full`}
          >
            <Text style={tw.style(bodyMediumBold, 'text-white')}>Retry</Text>
          </Pressable>
        </View>
      ) : !items || items.length === 0 ? (
        <View style={tw`flex-1 items-center justify-center px-5`}>
          <Ionicons name="checkmark-circle-outline" size={64} color="#22C55E" />
          <Text style={tw.style(bodyMediumBold, 'text-green-600 mt-3')}>
            All good!
          </Text>
          <Text style={tw.style(bodyMediumRegular, 'text-gray-400 mt-1 text-center')}>
            No items expiring within {days} day(s).
          </Text>
        </View>
      ) : (
        <ScrollView
          style={tw`flex-1`}
          contentContainerStyle={tw`px-5 pb-10 pt-2 gap-2`}
        >
          <Text style={tw.style(bodyMediumRegular, 'text-amber-700 mb-2')}>
            {items.length} item(s) expiring within {days} day(s)
          </Text>

          {items.map((item) => {
            const expiresAt = item.expiresAt ? new Date(item.expiresAt) : null;
            const now = new Date();
            const diffDays = expiresAt
              ? Math.ceil(
                  (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
                )
              : null;
            const isExpired = diffDays !== null && diffDays < 0;
            const isToday = diffDays === 0;

            return (
              <View
                key={item._id}
                style={tw.style(
                  'flex-row items-center bg-white rounded-xl border p-3',
                  isExpired
                    ? 'border-red-200 bg-red-50'
                    : isToday
                      ? 'border-amber-200 bg-amber-50'
                      : 'border-gray-100',
                )}
              >
                {/* Image */}
                <View style={tw`w-11 h-11 rounded-lg bg-gray-100 items-center justify-center mr-3`}>
                  {item.heroImageUrl ? (
                    <Image
                      source={{ uri: item.heroImageUrl }}
                      style={tw`w-11 h-11 rounded-lg`}
                    />
                  ) : (
                    <Ionicons name="nutrition-outline" size={20} color="#9CA3AF" />
                  )}
                </View>

                {/* Info */}
                <View style={tw`flex-1`}>
                  <Text style={tw.style(bodyMediumBold, 'text-gray-900')}>
                    {item.name}
                  </Text>
                  <Text style={tw`text-xs text-gray-500`}>
                    {item.quantity} {item.unit}
                  </Text>
                  <Text
                    style={tw.style(
                      'text-xs font-medium',
                      isExpired
                        ? 'text-red-600'
                        : isToday
                          ? 'text-amber-600'
                          : 'text-amber-500',
                    )}
                  >
                    {isExpired
                      ? `Expired ${Math.abs(diffDays!)} day(s) ago`
                      : isToday
                        ? 'Expires today!'
                        : `${diffDays} day(s) left`}
                  </Text>
                </View>

                {/* Action */}
                <Pressable
                  onPress={() => setDiscardItem(item)}
                  style={tw`bg-amber-100 px-3 py-1.5 rounded-full`}
                >
                  <Text style={tw`text-xs text-amber-700 font-medium`}>
                    Discard
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Discard Modal */}
      {discardItem && (
        <DiscardItemModal
          visible={!!discardItem}
          item={discardItem}
          onClose={() => setDiscardItem(null)}
        />
      )}
    </SafeAreaView>
  );
}
