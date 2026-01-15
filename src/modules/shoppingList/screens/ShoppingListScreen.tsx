import React, { useState, useMemo } from 'react';
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
import FocusAwareStatusBar from '../../../common/components/FocusAwareStatusBar';
import { subheadMediumUppercase, bodyMediumRegular, bodyMediumBold, h6TextStyle } from '../../../theme/typography';
import AddManualItemModal from '../components/AddManualItemModal';
import ConfirmationModal from '../components/ConfirmationModal';
import {
  useGetShoppingListQuery,
  useGetShoppingListStatisticsQuery,
  useBatchUpdateItemsMutation,
  useDeleteShoppingListItemMutation,
  useArchiveListMutation,
  ShoppingListItemData,
} from '../api/shoppingListApi';

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
  const { data: stats } = useGetShoppingListStatisticsQuery();
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
    <View style={tw`flex-1 bg-creme`}>
      <FocusAwareStatusBar statusBarStyle="dark" />
      
      {/* Header */}
      <SafeAreaView style={tw`bg-white border-b border-strokecream`}>
        <View style={tw`flex-row items-center justify-between px-5 py-4`}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={tw`h-10 w-10 items-center justify-center rounded-full`}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={tw.color('black')} />
          </Pressable>
          
          <View style={tw`flex-1 items-center`}>
            <Text style={tw.style(h6TextStyle, 'text-eggplant')}>Shopping List</Text>
            {stats && stats.totalListsCreated > 0 && (
              <Text style={tw.style(bodyMediumRegular, 'text-stone text-xs mt-1')}>
                List #{stats.totalListsCreated - stats.totalListsArchived}
                {stats.totalListsArchived > 0 && ` • ${stats.totalListsArchived} completed`}
              </Text>
            )}
          </View>
          
          <Pressable
            onPress={refetch}
            style={tw`h-10 w-10 items-center justify-center rounded-full`}
            accessibilityRole="button"
            accessibilityLabel="Refresh list"
          >
            <Ionicons name="refresh" size={22} color={tw.color('eggplant')} />
          </Pressable>
        </View>
        
        {/* Filter Tabs */}
        <View style={tw`flex-row px-5 pb-3`}>
          {(['ALL', 'PENDING', 'PURCHASED'] as const).map((filterType) => (
            <Pressable
              key={filterType}
              onPress={() => setFilter(filterType)}
              style={tw.style(
                'mr-3 px-4 py-2 rounded-full',
                filter === filterType ? 'bg-eggplant' : 'bg-creme-2'
              )}
            >
              <Text
                style={tw.style(
                  subheadMediumUppercase,
                  filter === filterType ? 'text-white' : 'text-stone'
                )}
              >
                {filterType}
                {filterType === 'PENDING' && ` (${pendingCount})`}
                {filterType === 'PURCHASED' && ` (${purchasedCount})`}
              </Text>
            </Pressable>
          ))}
        </View>
      </SafeAreaView>

      {/* Content */}
      {isLoading ? (
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color={tw.color('eggplant')} />
        </View>
      ) : displayItems.length === 0 ? (
        <View style={tw`flex-1 items-center justify-center px-10`}>
          <Image
            source={require('../../../../assets/carrot.png')}
            style={tw`w-40 h-40 opacity-60`}
            resizeMode="contain"
          />
          <Text style={tw.style(bodyMediumBold, 'text-stone text-center mt-4')}>
            {isError 
              ? 'No items added yet'
              : filter === 'PURCHASED' 
                ? 'No purchased items yet' 
                : 'Your shopping list is empty'}
          </Text>
          <Text style={tw.style(bodyMediumRegular, 'text-stone text-center mt-2')}>
            {isError 
              ? 'Tap the + button below to add your first item'
              : 'Add ingredients from recipes or when you run out while cooking'}
          </Text>
        </View>
      ) : (
        <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false}>
          <View style={tw`px-5 py-4`}>
            {displayItems.map((item) => (
              <View
                key={item.index}
                style={tw`bg-white rounded-2lg mb-3 p-4 border border-strokecream`}
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
                        'h-6 w-6 rounded-md border-2 items-center justify-center',
                        item.status === 'PURCHASED'
                          ? 'bg-kale border-kale'
                          : selectedIndices.has(item.index)
                          ? 'bg-eggplant border-eggplant'
                          : 'border-stone'
                      )}
                    >
                      {(item.status === 'PURCHASED' || selectedIndices.has(item.index)) && (
                        <Ionicons name="checkmark" size={16} color="white" />
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
                          <View style={tw`flex-row items-center mt-2`}>
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
                        style={tw`ml-2 p-2`}
                      >
                        <Ionicons name="trash-outline" size={20} color={tw.color('validation')} />
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
          
          {/* Mark as Purchased Button - Shows when items are selected */}
          {selectedIndices.size > 0 && (
            <View style={tw`px-5 pb-3`}>
              <Pressable
                onPress={handleMarkPurchased}
                disabled={isUpdating}
                style={tw`bg-eggplant rounded-2lg py-4 items-center shadow-md`}
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
                style={tw`bg-kale rounded-2lg py-4 items-center shadow-md`}
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
      )}

      {/* Floating Add Button */}
      <Pressable
        onPress={() => setShowAddModal(true)}
        style={tw`absolute bottom-6 right-6 h-14 w-14 rounded-full bg-eggplant shadow-lg items-center justify-center`}
        accessibilityRole="button"
        accessibilityLabel="Add item to shopping list"
      >
        <Ionicons name="add" size={28} color="white" />
      </Pressable>

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
    </View>
  );
}
