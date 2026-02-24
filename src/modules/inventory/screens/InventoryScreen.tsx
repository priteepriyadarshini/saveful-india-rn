import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import tw from '../../../common/tailwind';
import { useNavigation } from '@react-navigation/native';
import FocusAwareStatusBar from '../../../common/components/FocusAwareStatusBar';
import {
  subheadMediumUppercase,
  bodyMediumRegular,
  bodyMediumBold,
  h6TextStyle,
} from '../../../theme/typography';
import {
  useGetInventoryGroupedQuery,
  useDeleteInventoryItemMutation,
  useGetOutOfStockStaplesQuery,
} from '../api/inventoryApi';
import {
  InventoryItem,
  StorageLocation,
  FreshnessStatus,
} from '../api/types';
import AddInventoryItemModal from '../components/AddInventoryItemModal';
import EditInventoryItemModal from '../components/EditInventoryItemModal';
import DiscardItemModal from '../components/DiscardItemModal';

type StorageTab = 'all' | StorageLocation;

const STORAGE_TABS: { key: StorageTab; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: 'grid-outline' },
  { key: StorageLocation.FRIDGE, label: 'Fridge', icon: 'snow-outline' },
  { key: StorageLocation.FREEZER, label: 'Freezer', icon: 'cube-outline' },
  { key: StorageLocation.PANTRY, label: 'Pantry', icon: 'file-tray-stacked-outline' },
  { key: StorageLocation.OTHER, label: 'Other', icon: 'ellipsis-horizontal-outline' },
];

function getFreshnessColor(status: FreshnessStatus): string {
  switch (status) {
    case FreshnessStatus.FRESH:
      return '#22C55E';
    case FreshnessStatus.EXPIRING_SOON:
      return '#F59E0B';
    case FreshnessStatus.EXPIRED:
      return '#EF4444';
    default:
      return '#6B7280';
  }
}

function getFreshnessLabel(status: FreshnessStatus): string {
  switch (status) {
    case FreshnessStatus.FRESH:
      return 'Fresh';
    case FreshnessStatus.EXPIRING_SOON:
      return 'Expiring Soon';
    case FreshnessStatus.EXPIRED:
      return 'Expired';
    default:
      return '';
  }
}

function formatExpiryDate(dateStr?: string): string {
  if (!dateStr) return 'No expiry';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `Expired ${Math.abs(diffDays)}d ago`;
  if (diffDays === 0) return 'Expires today';
  if (diffDays === 1) return 'Expires tomorrow';
  if (diffDays <= 7) return `${diffDays} days left`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function InventoryScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<StorageTab>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [discardItem, setDiscardItem] = useState<InventoryItem | null>(null);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);

  const {
    data: grouped,
    isLoading,
    isError,
    refetch,
  } = useGetInventoryGroupedQuery();
  const [deleteItem] = useDeleteInventoryItemMutation();
  const { data: outOfStockStaples } = useGetOutOfStockStaplesQuery();

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const allItems = useMemo(() => {
    if (!grouped) return [];
    return [
      ...grouped.fridge,
      ...grouped.freezer,
      ...grouped.pantry,
      ...grouped.other,
    ];
  }, [grouped]);

  const displayedItems = useMemo(() => {
    if (activeTab === 'all') return allItems;
    return grouped?.[activeTab] || [];
  }, [activeTab, allItems, grouped]);

  const handleDelete = (item: InventoryItem) => {
    Alert.alert(
      'Remove Item',
      `Remove "${item.name}" from inventory?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteItem(item._id).unwrap();
            } catch (e) {
              Alert.alert('Error', 'Failed to remove item');
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
      <FocusAwareStatusBar statusBarStyle="dark" />

      {/* Header */}
      <View style={tw`px-5 pt-3 pb-2 flex-row items-center justify-between`}>
        <Text style={tw.style(h6TextStyle, 'text-gray-900')}>My Kitchen</Text>
        <View style={tw`flex-row items-center gap-3`}>
          <Pressable
            onPress={() => navigation.navigate('InventoryVoiceAdd')}
            style={tw`w-10 h-10 rounded-full bg-green-50 items-center justify-center`}
          >
            <Ionicons name="mic-outline" size={22} color="#16A34A" />
          </Pressable>
          <Pressable
            onPress={() => setShowAddModal(true)}
            style={tw`w-10 h-10 rounded-full bg-green-600 items-center justify-center`}
          >
            <Ionicons name="add" size={24} color="white" />
          </Pressable>
        </View>
      </View>

      {grouped?.summary && (
        <View style={tw`px-5 py-3 flex-row gap-3`}>
          <View style={tw`flex-1 bg-green-50 rounded-xl p-3 items-center`}>
            <Text style={tw.style(bodyMediumBold, 'text-green-700')}>
              {grouped.summary.total}
            </Text>
            <Text style={tw.style(bodyMediumRegular, 'text-green-600 text-xs')}>
              Total Items
            </Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate('InventoryExpiring')}
            style={tw`flex-1 bg-amber-50 rounded-xl p-3 items-center`}
          >
            <Text style={tw.style(bodyMediumBold, 'text-amber-700')}>
              {grouped.summary.expiringSoon}
            </Text>
            <Text style={tw.style(bodyMediumRegular, 'text-amber-600 text-xs')}>
              Expiring Soon
            </Text>
          </Pressable>
          <Pressable
          onPress={() => navigation.navigate('InventoryWasteAnalytics')}
            style={tw`flex-1 bg-red-50 rounded-xl p-3 items-center`}
          >
            <Text style={tw.style(bodyMediumBold, 'text-red-700')}>
              {grouped.summary.expired}
            </Text>
            <Text style={tw.style(bodyMediumRegular, 'text-red-600 text-xs')}>
              Expired
            </Text>
          </Pressable>
        </View>
      )}

      {outOfStockStaples && outOfStockStaples.length > 0 && (
        <View style={tw`mx-5 mt-1 mb-1 bg-blue-50 rounded-xl px-4 py-3 flex-row items-center gap-2`}>
          <Ionicons name="alert-circle" size={20} color="#3B82F6" />
          <View style={tw`flex-1`}>
            <Text style={tw.style(bodyMediumBold, 'text-blue-700 text-xs')}>
              Out of Stock Staples
            </Text>
            <Text style={tw.style(bodyMediumRegular, 'text-blue-600 text-xs')} numberOfLines={2}>
              {outOfStockStaples.join(', ')}
            </Text>
          </View>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={tw`flex-grow-0`}
        contentContainerStyle={tw`px-5 gap-1.5 py-1`}
      >
        {STORAGE_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count =
            tab.key === 'all'
              ? allItems.length
              : (grouped?.[tab.key as StorageLocation] || []).length;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={tw.style(
                'flex-row items-center gap-1  px-3 h-7 rounded-full',
                isActive ? 'bg-green-600' : 'bg-gray-100',
              )}
            >
              <Ionicons
                name={tab.icon as any}
                size={13}
                color={isActive ? 'white' : '#6B7280'}
              />
              <Text
                style={tw.style(
                  bodyMediumRegular,
                  isActive ? 'text-white' : 'text-gray-600',
                  'text-xs',
                )}
              >
                {tab.label} ({count})
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {isLoading ? (
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color="#16A34A" />
        </View>
      ) : isError ? (
        <View style={tw`flex-1 items-center justify-center px-5`}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={tw.style(bodyMediumRegular, 'text-red-500 mt-2')}>
            Failed to load inventory
          </Text>
          <Pressable
            onPress={() => refetch()}
            style={tw`mt-3 bg-green-600 px-6 py-2 rounded-full`}
          >
            <Text style={tw.style(bodyMediumBold, 'text-white')}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          style={tw`flex-1`}
          contentContainerStyle={tw`pb-20`}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Quick Actions */}
          <View style={tw`px-5 pt-1 pb-2 flex-row gap-2`}>
            <Pressable
              onPress={() => navigation.navigate('InventoryMealSuggestions')}
              style={tw`flex-1 flex-row items-center gap-2 bg-orange-50 rounded-xl px-4 py-3`}
            >
              <Ionicons name="restaurant-outline" size={18} color="#EA580C" />
              <Text style={tw.style(bodyMediumRegular, 'text-orange-700 text-sm')}>
                What can I cook?
              </Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('InventoryWasteAnalytics')}
              style={tw`flex-1 flex-row items-center gap-2 bg-purple-50 rounded-xl px-4 py-3`}
            >
              <Ionicons name="pie-chart-outline" size={18} color="#7C3AED" />
              <Text style={tw.style(bodyMediumRegular, 'text-purple-700 text-sm')}>
                Waste Tracker
              </Text>
            </Pressable>
          </View>

          {displayedItems.length === 0 ? (
            <View style={tw`items-center justify-center px-5 mt-16`}>
              <Ionicons name="basket-outline" size={64} color="#D1D5DB" />
              <Text style={tw.style(bodyMediumBold, 'text-gray-400 mt-3')}>
                Your kitchen is empty
              </Text>
              <Text style={tw.style(bodyMediumRegular, 'text-gray-400 mt-1 text-center')}>
                Add ingredients using the + button or{' '}speak to add them by voice
              </Text>
              <View style={tw`flex-row items-center justify-center mt-1`}>
                <Ionicons name="mic-outline" size={18} color="#D1D5DB" />
              </View>
            </View>
          ) : (
            <View style={tw`px-5 gap-2`}>
              {displayedItems.map((item) => (
                <InventoryItemCard
                  key={item._id}
                  item={item}
                  onEdit={() => setEditItem(item)}
                  onDiscard={() => setDiscardItem(item)}
                  onDelete={() => handleDelete(item)}
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* Modals */}
      <AddInventoryItemModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
      <EditInventoryItemModal
        visible={!!editItem}
        item={editItem}
        onClose={() => setEditItem(null)}
      />
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


function InventoryItemCard({
  item,
  onEdit,
  onDiscard,
  onDelete,
}: {
  item: InventoryItem;
  onEdit: () => void;
  onDiscard: () => void;
  onDelete: () => void;
}) {
  const freshnessColor = getFreshnessColor(item.freshnessStatus);

  return (
    <View
      style={tw`flex-row items-center bg-white rounded-xl border border-gray-100 p-3 shadow-sm`}
    >
      {/* Image / Icon */}
      <View style={tw`w-12 h-12 rounded-lg bg-gray-100 items-center justify-center mr-3`}>
        {item.heroImageUrl ? (
          <Image
            source={{ uri: item.heroImageUrl }}
            style={tw`w-12 h-12 rounded-lg`}
            resizeMode="cover"
          />
        ) : (
          <Ionicons name="nutrition-outline" size={24} color="#9CA3AF" />
        )}
      </View>

      {/* Info */}
      <View style={tw`flex-1`}>
        <Text style={tw.style(bodyMediumBold, 'text-gray-900')} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={tw`flex-row items-center flex-wrap gap-0.5`}>
          <Text style={tw.style(bodyMediumRegular, 'text-gray-500 text-xs')}>
            {item.quantity} {item.unit}
          </Text>
          {item.isStaple && (
            <View style={tw`flex-row items-center gap-0.5`}>
              <Text style={tw.style(bodyMediumRegular, 'text-gray-400 text-xs')}> · </Text>
              <Ionicons name="star" size={10} color="#F59E0B" />
              <Text style={tw.style(bodyMediumRegular, 'text-amber-500 text-xs')}>Staple</Text>
            </View>
          )}
        </View>
        <View style={tw`flex-row items-center gap-1 mt-0.5`}>
          <View
            style={[
              tw`w-2 h-2 rounded-full`,
              { backgroundColor: freshnessColor },
            ]}
          />
          <Text style={[tw`text-xs`, { color: freshnessColor }]}>
            {formatExpiryDate(item.expiresAt)}
          </Text>
        </View>
      </View>

      <View style={tw`flex-row gap-1`}>
        <Pressable
          onPress={onEdit}
          style={tw`w-8 h-8 items-center justify-center rounded-full bg-blue-50`}
        >
          <Ionicons name="pencil-outline" size={16} color="#3B82F6" />
        </Pressable>
        <Pressable
          onPress={onDiscard}
          style={tw`w-8 h-8 items-center justify-center rounded-full bg-amber-50`}
        >
          <Ionicons name="trash-outline" size={16} color="#F59E0B" />
        </Pressable>
        <Pressable
          onPress={onDelete}
          style={tw`w-8 h-8 items-center justify-center rounded-full bg-red-50`}
        >
          <Ionicons name="close-outline" size={16} color="#EF4444" />
        </Pressable>
      </View>
    </View>
  );
}
