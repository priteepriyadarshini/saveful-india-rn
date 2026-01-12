import api from '../../api';

const analyticsApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    saveFoodAnalytics: builder.mutation<
      { success: boolean; foodsaved: number },
      { ingredientIds: string[]; frameworkId?: string }
    >({
      query: (params) => ({
        url: '/api/analytics',
        method: 'POST',
        body: {
          ingredinatsIds: params.ingredientIds,
          frameworkId: params.frameworkId,
        },
      }),
    }),
    getCookedRecipes: builder.query<{ cookedRecipes: string[] }, void>({
      query: () => ({
        url: '/api/analytics/cooked-recipes',
        method: 'GET',
      }),
    }),
  }),
});

export const { useSaveFoodAnalyticsMutation, useGetCookedRecipesQuery } = analyticsApi;
export default analyticsApi;
