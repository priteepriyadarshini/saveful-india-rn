import api from '../../api';
import {
  InventoryItem,
  InventoryGroupedResponse,
  AddInventoryItemDto,
  BatchAddInventoryItemsDto,
  UpdateInventoryItemDto,
  DiscardInventoryItemDto,
  VoiceAddInventoryDto,
  VoiceParseResponse,
  MealSuggestion,
  WasteAnalytics,
  WasteClassification,
  GetInventoryQueryParams,
} from './types';

const inventoryApi = api
  .enhanceEndpoints({
    addTagTypes: [
      'Inventory',
      'InventoryGrouped',
      'InventoryExpiring',
      'MealSuggestions',
      'WasteAnalytics',
    ],
  })
  .injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({

      getInventory: builder.query<InventoryItem[], GetInventoryQueryParams>({
        query: (params) => ({
          url: '/api/inventory',
          method: 'GET',
          params,
        }),
        providesTags: ['Inventory'],
      }),

      getInventoryGrouped: builder.query<InventoryGroupedResponse, void>({
        query: () => ({
          url: '/api/inventory/grouped',
          method: 'GET',
        }),
        providesTags: ['InventoryGrouped'],
      }),

      getExpiringItems: builder.query<InventoryItem[], number | void>({
        query: (days) => ({
          url: '/api/inventory/expiring',
          method: 'GET',
          params: days ? { days } : undefined,
        }),
        providesTags: ['InventoryExpiring'],
      }),

      getMealSuggestions: builder.query<
        MealSuggestion[],
        { country?: string; limit?: number } | void
      >({
        query: (params) => ({
          url: '/api/inventory/suggestions',
          method: 'GET',
          params: params || undefined,
        }),
        providesTags: ['MealSuggestions'],
      }),

      getWasteAnalytics: builder.query<WasteAnalytics, void>({
        query: () => ({
          url: '/api/inventory/analytics',
          method: 'GET',
        }),
        providesTags: ['WasteAnalytics'],
      }),

      getOutOfStockStaples: builder.query<string[], void>({
        query: () => ({
          url: '/api/inventory/staples/out-of-stock',
          method: 'GET',
        }),
        providesTags: ['Inventory'],
      }),

      addInventoryItem: builder.mutation<InventoryItem, AddInventoryItemDto>({
        query: (dto) => ({
          url: '/api/inventory',
          method: 'POST',
          body: dto,
        }),
        invalidatesTags: [
          'Inventory',
          'InventoryGrouped',
          'InventoryExpiring',
          'MealSuggestions',
        ],
      }),

      addInventoryBatch: builder.mutation<
        InventoryItem[],
        BatchAddInventoryItemsDto
      >({
        query: (dto) => ({
          url: '/api/inventory/batch',
          method: 'POST',
          body: dto,
        }),
        invalidatesTags: [
          'Inventory',
          'InventoryGrouped',
          'InventoryExpiring',
          'MealSuggestions',
        ],
      }),


      voiceAdd: builder.mutation<VoiceParseResponse, VoiceAddInventoryDto & { country?: string }>({
        query: ({ transcript, country }) => ({
          url: '/api/inventory/voice-add',
          method: 'POST',
          body: { transcript },
          params: country ? { country } : undefined,
        }),
      }),

      voiceConfirm: builder.mutation<
        InventoryItem[],
        BatchAddInventoryItemsDto
      >({
        query: (dto) => ({
          url: '/api/inventory/voice-confirm',
          method: 'POST',
          body: dto,
        }),
        invalidatesTags: [
          'Inventory',
          'InventoryGrouped',
          'InventoryExpiring',
          'MealSuggestions',
        ],
      }),


      updateInventoryItem: builder.mutation<
        InventoryItem,
        { id: string; dto: UpdateInventoryItemDto }
      >({
        query: ({ id, dto }) => ({
          url: `/api/inventory/${id}`,
          method: 'PATCH',
          body: dto,
        }),
        invalidatesTags: [
          'Inventory',
          'InventoryGrouped',
          'InventoryExpiring',
        ],
      }),

      deleteInventoryItem: builder.mutation<void, string>({
        query: (id) => ({
          url: `/api/inventory/${id}`,
          method: 'DELETE',
        }),
        invalidatesTags: [
          'Inventory',
          'InventoryGrouped',
          'InventoryExpiring',
          'MealSuggestions',
        ],
      }),


      discardInventoryItem: builder.mutation<
        InventoryItem,
        DiscardInventoryItemDto
      >({
        query: (dto) => ({
          url: '/api/inventory/discard',
          method: 'POST',
          body: dto,
        }),
        invalidatesTags: [
          'Inventory',
          'InventoryGrouped',
          'InventoryExpiring',
          'WasteAnalytics',
          'MealSuggestions',
        ],
      }),

      classifyWaste: builder.mutation<
        WasteClassification,
        { ingredientName: string; packaging?: string }
      >({
        query: (dto) => ({
          url: '/api/inventory/waste-classify',
          method: 'POST',
          body: dto,
        }),
      }),
    }),
  });

export const {
  // Queries
  useGetInventoryQuery,
  useGetInventoryGroupedQuery,
  useGetExpiringItemsQuery,
  useGetMealSuggestionsQuery,
  useGetWasteAnalyticsQuery,
  useGetOutOfStockStaplesQuery,
  // Mutations
  useAddInventoryItemMutation,
  useAddInventoryBatchMutation,
  useVoiceAddMutation,
  useVoiceConfirmMutation,
  useUpdateInventoryItemMutation,
  useDeleteInventoryItemMutation,
  useDiscardInventoryItemMutation,
  useClassifyWasteMutation,
} = inventoryApi;

export default inventoryApi;
