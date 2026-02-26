import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import tw from '../../../common/tailwind';
import { useNavigation } from '@react-navigation/native';
import FocusAwareStatusBar from '../../../common/components/FocusAwareStatusBar';
import Pill from '../../../common/components/Pill';
import { bodyMediumRegular, bodyMediumBold, h6TextStyle } from '../../../theme/typography';
import AddManualItemModal from '../components/AddManualItemModal';
import ConfirmationModal from '../components/ConfirmationModal';
import {
  useGetShoppingListQuery,
  useBatchUpdateItemsMutation,
  useDeleteShoppingListItemMutation,
  useArchiveListMutation,
  ShoppingListItemData,
} from '../api/shoppingListApi';

const FILTER_TABS: Array<'ALL' | 'PENDING' | 'PURCHASED'> = ['ALL', 'PENDING', 'PURCHASED'];

export default function ShoppingListScreen() {
  const navigation = useNavigation();
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'PURCHASED'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ visible: boolean; index?: number }>({ visible: false });
  const [archiveConfirmModal, setArchiveConfirmModal] = useState(false);

  // RTK Query hooks
  const { data, isLoading, isError, refetch } = useGetShoppingListQuery({ 
    status: filter === 'ALL' ? undefined : filter 
  });
  const [batchUpdate, { isLoading: isUpdating }] = useBatchUpdateItemsMutation();
  const [deleteItem] = useDeleteShoppingListItemMutation();
  const [archiveList, { isLoading: isArchiving }] = useArchiveListMutation();

  const items = data?.items || [];
  const pendingCount = data?.pendingItems || 0;
  const purchasedCount = data?.purchasedItems || 0;
  const totalItems = data?.totalItems || 0;

  // Check if all items are purchased
  const allItemsPurchased = useMemo(() => {
    return totalItems > 0 && pendingCount === 0;
  }, [totalItems, pendingCount]);

  // Clear selected indices when data changes
  useMemo(() => {
    setSelectedIndices(new Set());
  }, [data]);

  const handleToggleSelect = (index: number) => {
    setSelectedIndices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleMarkPurchased = async () => {
    if (selectedIndices.size === 0) return;

    const updates = Array.from(selectedIndices).map(index => ({
      index,
      status: 'PURCHASED' as const,
    }));

    try {
      await batchUpdate({ updates }).unwrap();
      setSelectedIndices(new Set());
    } catch (error) {
      console.error('Error marking items as purchased:', error);
    }
  };

  const handleDeleteItem = (index: number) => {
    setDeleteConfirmModal({ visible: true, index });
  };

  const confirmDelete = async () => {
    if (deleteConfirmModal.index === undefined) return;
    
    try {
      await deleteItem(deleteConfirmModal.index).unwrap();
      setDeleteConfirmModal({ visible: false });
    } catch (error) {
      console.error('Error deleting item:', error);
      setDeleteConfirmModal({ visible: false });
    }
  };

  const handleCreateNewList = () => {
    setArchiveConfirmModal(true);
  };

  const confirmArchive = async () => {
    try {
      await archiveList().unwrap();
      setArchiveConfirmModal(false);
      refetch();
    } catch (error) {
      console.error('Error creating new list:', error);
      setArchiveConfirmModal(false);
    }
  };

  const displayItems = useMemo(() => {
    return items.map((item, index) => ({
      ...item,
      index,
    }));
  }, [items]);

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
      <FocusAwareStatusBar statusBarStyle="dark" />
      
      {/* Header */}
      <View style={tw`px-5 pt-3 pb-2 flex-row items-center justify-between bg-white border-b border-strokecream`}>
        <View>
          <Text style={tw.style(h6TextStyle, 'text-gray-900')}>Shopping List</Text>
          <Text style={tw.style(bodyMediumRegular, 'text-gray-500 text-xs mt-0.5')}>
            Track what to buy and what you purchased
          </Text>
        </View>
        <View style={tw`flex-row items-center gap-3`}>
          <Pressable
            onPress={refetch}
            style={tw`w-10 h-10 rounded-full bg-green-50 items-center justify-center`}
            accessibilityRole="button"
            accessibilityLabel="Refresh list"
          >
            <Ionicons name="refresh" size={20} color="#16A34A" />
          </Pressable>
          <Pressable
            onPress={() => setShowAddModal(true)}
            style={tw`w-10 h-10 rounded-full bg-green-600 items-center justify-center`}
            accessibilityRole="button"
            accessibilityLabel="Add item to shopping list"
          >
            <Ionicons name="add" size={24} color="white" />
          </Pressable>
        </View>
      </View>

      {/* Summary */}
      <View style={tw`px-5 py-3 flex-row gap-3 bg-white`}>
        <View style={tw`flex-1 bg-white border border-strokecream rounded-xl p-3 items-center`}>
          <Text style={tw.style(bodyMediumBold, 'text-green-700')}>
            {totalItems}
          </Text>
          <Text style={tw.style(bodyMediumRegular, 'text-green-600 text-xs')}>
            Total Items
          </Text>
        </View>
        <View style={tw`flex-1 bg-white border border-strokecream rounded-xl p-3 items-center`}>
          <Text style={tw.style(bodyMediumBold, 'text-amber-700')}>
            {pendingCount}
          </Text>
          <Text style={tw.style(bodyMediumRegular, 'text-amber-600 text-xs')}>
            Pending
          </Text>
        </View>
        <View style={tw`flex-1 bg-white border border-strokecream rounded-xl p-3 items-center`}>
          <Text style={tw.style(bodyMediumBold, 'text-kale')}>
            {purchasedCount}
          </Text>
          <Text style={tw.style(bodyMediumRegular, 'text-kale text-xs')}>
            Purchased
          </Text>
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color={tw.color('eggplant')} />
        </View>
      ) : totalItems === 0 ? (
        <View style={tw`flex-1 items-center justify-center px-10`}>
          <Image
            source={{ uri: 'https://d3fg04h02j12vm.cloudfront.net/carrot.png' }}
            style={tw`w-40 h-40 opacity-60`}
            resizeMode="contain"
          />
          <Text style={tw.style(bodyMediumBold, 'text-stone text-center mt-4')}>
            {isError ? 'No items added yet' : 'Your shopping list is empty'}
          </Text>
          <Text style={tw.style(bodyMediumRegular, 'text-stone text-center mt-2')}>
            {isError
              ? 'Tap the + button below to add your first item'
              : 'Add ingredients from recipes or tap + to add items manually'}
          </Text>
        </View>
      ) : (
        <View style={tw`flex-1`}>
     
          <View style={tw`px-5 py-3 items-center bg-white border-b border-strokecream`}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={tw`gap-2 items-center`}
            >
              {FILTER_TABS.map((filterType) => (
                <Pill
                  key={filterType}
                  text={`${filterType}${
                    filterType === 'PENDING'
                      ? ` (${pendingCount})`
                      : filterType === 'PURCHASED'
                      ? ` (${purchasedCount})`
                      : ` (${totalItems})`
                  }`}
                  size="small"
                  kind="vibrant"
                  isActive={filter === filterType}
                  setIsActive={() => setFilter(filterType)}
                />
              ))}
            </ScrollView>
          </View>

          {displayItems.length === 0 ? (
            <View style={tw`flex-1 items-center justify-center px-10`}>
              <Image
                source={{ uri: 'https://d3fg04h02j12vm.cloudfront.net/carrot.png' }}
                style={tw`w-32 h-32 opacity-40`}
                resizeMode="contain"
              />
              <Text style={tw.style(bodyMediumBold, 'text-stone text-center mt-4')}>
                {filter === 'PURCHASED' ? 'No purchased items yet' : 'No pending items'}
              </Text>
              <Text style={tw.style(bodyMediumRegular, 'text-stone text-center mt-2')}>
                {filter === 'PURCHASED'
                  ? 'Items you mark as purchased will appear here'
                  : 'All items have been purchased!'}
              </Text>
            </View>
          ) : (
            <ImageBackground
              style={tw`flex-1`}
              source={{ uri: 'https://d3fg04h02j12vm.cloudfront.net/ribbons/lemon.png' }}
            >
              <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false}>
                <View style={tw`px-5 pt-3 pb-2`}>
                  {displayItems.map((item) => (
                    <View
                      key={item.index}
                      style={tw`bg-white rounded-xl mb-2.5 p-3 border border-gray-100 shadow-sm`}
                    >
                      <View style={tw`flex-row items-start`}>
                        {/* Checkbox */}
                        <Pressable
                          onPress={() => handleToggleSelect(item.index)}
                          style={tw`mr-3 mt-1`}
                          disabled={item.status === 'PURCHASED'}
                        >
                          <View
                            style={tw.style(
                              'h-5 w-5 rounded-md border-2 items-center justify-center',
                              item.status === 'PURCHASED'
                                ? 'bg-kale border-kale'
                                : selectedIndices.has(item.index)
                                ? 'bg-eggplant border-eggplant'
                                : 'border-stone'
                            )}
                          >
                            {(item.status === 'PURCHASED' || selectedIndices.has(item.index)) && (
                              <Ionicons name="checkmark" size={13} color="white" />
                            )}
                          </View>
                        </Pressable>

                        {/* Content */}
                        <View style={tw`flex-1`}>
                          <View style={tw`flex-row items-start justify-between`}>
                            <View style={tw`flex-1`}>
                              <Text
                                style={tw.style(
                                  bodyMediumBold,
                                  item.status === 'PURCHASED' && 'line-through text-stone'
                                )}
                              >
                                {item.ingredientName || item.ingredientId?.name || 'Unknown Ingredient'}
                              </Text>
                              <Text style={tw.style(bodyMediumRegular, 'text-stone mt-1')}>
                                {item.quantity}
                                {item.unit ? ` ${item.unit}` : ''}
                              </Text>

                              {item.source === 'RECIPE' && item.recipeId && (
                                <View style={tw`flex-row items-center mt-1.5`}>
                                  <Ionicons name="restaurant" size={12} color={tw.color('orange')} />
                                  <Text style={tw.style(bodyMediumRegular, 'text-orange ml-1 text-xs')}>
                                    From {item.recipeId.name}
                                  </Text>
                                </View>
                              )}

                              {item.notes && (
                                <Text style={tw.style(bodyMediumRegular, 'text-stone mt-2 text-sm italic')}>
                                  {item.notes}
                                </Text>
                              )}
                            </View>

                            {/* Delete Button */}
                            <Pressable
                              onPress={() => handleDeleteItem(item.index)}
                              style={tw`ml-2 w-8 h-8 rounded-full bg-red-50 items-center justify-center`}
                            >
                              <Ionicons name="trash-outline" size={16} color={tw.color('validation')} />
                            </Pressable>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Mark as Purchased Button - Shows when items are selected */}
                {selectedIndices.size > 0 && (
                  <View style={tw`px-5 pb-3 pt-1`}>
                    <Pressable
                      onPress={handleMarkPurchased}
                      disabled={isUpdating}
                      style={tw`bg-eggplant rounded-full py-3 items-center`}
                    >
                      {isUpdating ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <View style={tw`flex-row items-center`}>
                          <Ionicons name="cart" size={20} color="white" style={tw`mr-2`} />
                          <Text style={tw.style(bodyMediumBold, 'text-white')}>
                            Mark {selectedIndices.size} Item{selectedIndices.size > 1 ? 's' : ''} as Purchased
                          </Text>
                        </View>
                      )}
                    </Pressable>
                  </View>
                )}

                {/* Create New List Button - Shows when all items are purchased */}
                {allItemsPurchased && (
                  <View style={tw`px-5 pb-5`}>
                    <Pressable
                      onPress={handleCreateNewList}
                      disabled={isArchiving}
                      style={tw`bg-kale rounded-full py-3 items-center`}
                    >
                      {isArchiving ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <View style={tw`flex-row items-center`}>
                          <Ionicons name="checkmark-circle" size={24} color="white" style={tw`mr-2`} />
                          <Text style={tw.style(bodyMediumBold, 'text-white')}>
                            All Done! Create New List
                          </Text>
                        </View>
                      )}
                    </Pressable>
                  </View>
                )}
              </ScrollView>
            </ImageBackground>
          )}
        </View>
      )}

      {/* Add Manual Item Modal */}
      <AddManualItemModal
        isVisible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={refetch}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isVisible={deleteConfirmModal.visible}
        onClose={() => setDeleteConfirmModal({ visible: false })}
        onConfirm={confirmDelete}
        title="Delete Item"
        message="Are you sure you want to remove this item from your shopping list?"
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="validation"
        icon="trash"
        iconColor="validation"
      />

      {/* Archive List Confirmation Modal */}
      <ConfirmationModal
        isVisible={archiveConfirmModal}
        onClose={() => setArchiveConfirmModal(false)}
        onConfirm={confirmArchive}
        title="Create New List"
        message="This will archive your current shopping list and start fresh. Your completed list will be saved for reference."
        confirmText="Create New"
        cancelText="Cancel"
        confirmColor="kale"
        icon="checkmark-circle"
        iconColor="kale"
        isLoading={isArchiving}
      />
    </SafeAreaView>
  );
}
