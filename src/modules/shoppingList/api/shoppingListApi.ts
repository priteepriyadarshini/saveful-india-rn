import api from '../../api';

export interface ShoppingListItemData {
  ingredientId?: {
    _id: string;
    name: string;
    averageWeight: number;
    categoryId?: string;
    heroImageUrl?: string;
    theme?: string;
  };
  ingredientName?: string;
  quantity?: string;
  unit?: string;
  source: 'RECIPE' | 'MANUAL';
  status: 'PENDING' | 'PURCHASED';
  recipeId?: {
    _id: string;
    name: string;
    heroImageUrl?: string;
  };
  notes?: string;
  addedAt: string;
  purchasedAt?: string;
}

export interface ShoppingListResponse {
  listId: string;
  items: ShoppingListItemData[];
  totalItems: number;
  pendingItems: number;
  purchasedItems: number;
}

export interface AddShoppingListItemDto {
  ingredientId?: string;
  ingredientName?: string;
  quantity?: string;
  unit?: string;
  source?: 'RECIPE' | 'MANUAL';
  recipeId?: string;
  notes?: string;
}

export interface AddIngredientsFromRecipeDto {
  recipeId: string;
  ingredients: {
    ingredientId?: string;
    ingredientName?: string;
    quantity?: string;
  }[];
}

export interface UpdateShoppingListItemDto {
  quantity?: string;
  unit?: string;
  notes?: string;
  status?: 'PENDING' | 'PURCHASED';
}

export interface BatchUpdateItem {
  index: number;
  status: 'PENDING' | 'PURCHASED';
}

export interface BatchUpdateItemsDto {
  updates: BatchUpdateItem[];
}

export interface ShoppingListStatistics {
  currentList: {
    total: number;
    pending: number;
    purchased: number;
    fromRecipes: number;
    manual: number;
  };
  totalListsCreated: number;
  totalListsArchived: number;
}

const shoppingListApi = api
  .enhanceEndpoints({
    addTagTypes: ['ShoppingList', 'ShoppingListStats'],
  })
  .injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
      getShoppingList: builder.query<ShoppingListResponse, { status?: 'PENDING' | 'PURCHASED' }>({
        query: ({ status }) => ({
          url: '/api/shopping-list',
          method: 'GET',
          params: status ? { status } : undefined,
        }),
        providesTags: ['ShoppingList'],
      }),

      getShoppingListStatistics: builder.query<ShoppingListStatistics, void>({
        query: () => ({
          url: '/api/shopping-list/statistics',
          method: 'GET',
        }),
        providesTags: ['ShoppingListStats'],
      }),

      addShoppingListItem: builder.mutation<ShoppingListResponse, AddShoppingListItemDto>({
        query: (dto) => ({
          url: '/api/shopping-list',
          method: 'POST',
          body: dto,
        }),
        invalidatesTags: ['ShoppingList', 'ShoppingListStats'],
      }),

      addIngredientsFromRecipe: builder.mutation<ShoppingListResponse, AddIngredientsFromRecipeDto>({
        query: (dto) => ({
          url: '/api/shopping-list/from-recipe',
          method: 'POST',
          body: dto,
        }),
        invalidatesTags: ['ShoppingList', 'ShoppingListStats'],
      }),

      batchUpdateItems: builder.mutation<ShoppingListResponse, BatchUpdateItemsDto>({
        query: (dto) => ({
          url: '/api/shopping-list/batch-update',
          method: 'POST',
          body: dto,
        }),
        invalidatesTags: ['ShoppingList', 'ShoppingListStats'],
      }),

      updateShoppingListItem: builder.mutation<
        ShoppingListResponse,
        { index: number; dto: UpdateShoppingListItemDto }
      >({
        query: ({ index, dto }) => ({
          url: `/api/shopping-list/${index}`,
          method: 'PUT',
          body: dto,
        }),
        invalidatesTags: ['ShoppingList', 'ShoppingListStats'],
      }),

      deleteShoppingListItem: builder.mutation<void, number>({
        query: (index) => ({
          url: `/api/shopping-list/${index}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['ShoppingList', 'ShoppingListStats'],
      }),

      clearPurchasedItems: builder.mutation<{ deletedCount: number }, void>({
        query: () => ({
          url: '/api/shopping-list/purchased',
          method: 'DELETE',
        }),
        invalidatesTags: ['ShoppingList', 'ShoppingListStats'],
      }),

      archiveList: builder.mutation<ShoppingListResponse, void>({
        query: () => ({
          url: '/api/shopping-list/archive',
          method: 'POST',
        }),
        invalidatesTags: ['ShoppingList', 'ShoppingListStats'],
      }),
    }),
  });

export const {
  useGetShoppingListQuery,
  useGetShoppingListStatisticsQuery,
  useAddShoppingListItemMutation,
  useAddIngredientsFromRecipeMutation,
  useBatchUpdateItemsMutation,
  useUpdateShoppingListItemMutation,
  useDeleteShoppingListItemMutation,
  useClearPurchasedItemsMutation,
  useArchiveListMutation,
} = shoppingListApi;

export default shoppingListApi;
