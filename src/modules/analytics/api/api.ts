import api from '../../api';

const analyticsApi = api
  .enhanceEndpoints({
    addTagTypes: ['Analytics'],
  })
  .injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    saveFoodAnalytics: builder.mutation<
      { success: boolean; foodsaved: number },
      { ingredientIds: string[]; frameworkId?: string; ingredients?: { name: string; averageWeight: number }[] }
    >({
      query: (params) => ({
        url: '/api/analytics',
        method: 'POST',
        body: {
          ingredinatsIds: params.ingredientIds,
          frameworkId: params.frameworkId,
          ingredients: params.ingredients,
        },
      }),
      invalidatesTags: ['Analytics'],
    }),
    getCookedRecipes: builder.query<{ cookedRecipes: string[]; numberOfMealsCooked: number }, void>({
      query: () => ({
        url: '/api/analytics/cooked-recipes',
        method: 'GET',
      }),
      providesTags: ['Analytics'],
    }),
    getCookedRecipesDetails: builder.query<{ cookedRecipes: { id: string; title: string; shortDescription?: string; heroImageUrl?: string }[] }, void>({
      query: () => ({
        url: '/api/analytics/cooked-recipes/details',
        method: 'GET',
      }),
      providesTags: ['Analytics'],
    }),
    getUserStats: builder.query<{
      food_savings_user: string;
      completed_meals_count: number;
      best_food_savings: null;
      total_co2_savings: null;
      total_cost_savings: null;
      best_co2_savings: null;
      best_cost_savings: null;
      food_savings_all_users: string;
    }, void>({
      query: () => ({
        url: '/api/analytics/stats',
        method: 'GET',
      }),
      providesTags: ['Analytics'],
    }),
    getTrendingRecipes: builder.query<{ trending: { id: string; title: string; shortDescription?: string; heroImageUrl?: string; count: number }[] }, void>({
      query: () => ({
        url: '/api/analytics/trending',
        method: 'GET',
      }),
      providesTags: ['Analytics'],
    }),
  }),
});

export const { 
  useSaveFoodAnalyticsMutation, 
  useGetCookedRecipesQuery,
  useGetCookedRecipesDetailsQuery,
  useGetUserStatsQuery,
  useGetTrendingRecipesQuery,
} = analyticsApi;
export default analyticsApi;
