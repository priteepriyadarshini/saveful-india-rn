import api from '../../../modules/api';
import groupsApi from '../../../modules/groups/api/api';
import {
  Favourite,
  FavouriteResponse,
  FavouriteResult,
  FavouritesResponse,
  FeedbackResponse,
  FeedbackResult,
  FeedbacksForFrameworkResponse,
  Stats,
  StatsResponse,
} from '../../../modules/track/api/types';

const trackApi = api
  .enhanceEndpoints({
    addTagTypes: ['Feedback', 'UserMeals', 'Favourites', 'Stats'],
  })
  .injectEndpoints({
    overrideExisting: true,
    endpoints: builder => ({
      createFeedback: builder.mutation<
        FeedbackResult,
        {
          frameworkId: string;
          prompted: boolean;
          didYouLikeIt?: boolean;
          foodSaved: number;
          mealId: string;
          rating?: number; // 1-5 carrot rating
          review?: string; // Optional review text
        }
      >({
        query: params => ({
          url: '/api/feedback',
          method: 'POST',
          body: {
            framework_id: params.frameworkId,
            prompted: params.prompted,
            data: {
              did_you_like_it: params.didYouLikeIt,
              food_saved: params.foodSaved,
              meal_id: params.mealId,
              ...(params.rating !== undefined ? { rating: params.rating } : {}),
              ...(params.review !== undefined ? { review: params.review } : {}),
            },
          },
        }),
        invalidatesTags: ['Feedback', 'Stats'],
        transformResponse: r => (r as FeedbackResponse).feedback,
        onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
          await queryFulfilled;
          dispatch(
            groupsApi.util.invalidateTags(['Groups', 'GroupChallenges']),
          );
        },
      }),
      updateFeedback: builder.mutation<
        FeedbackResult,
        {
          id: string;
          prompted?: boolean;
          didYouLikeIt?: boolean;
          foodSaved?: number;
          mealId?: string;
          rating?: number; // 1-5 carrot rating
          review?: string; // Optional review text
        }
      >({
        query: params => ({
          url: `/api/feedback/${params.id}/update`,
          method: 'POST',
          body: {
            prompted: params.prompted,
            data: {
              did_you_like_it: params.didYouLikeIt,
              ...(params.foodSaved
                ? {
                    food_saved: params.foodSaved,
                  }
                : {}),
              meal_id: params.mealId,
              ...(params.rating !== undefined ? { rating: params.rating } : {}),
              ...(params.review !== undefined ? { review: params.review } : {}),
            },
          },
        }),
        invalidatesTags: ['Feedback', 'Stats'],
        transformResponse: r => (r as FeedbackResponse).feedback,
        onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
          await queryFulfilled;
          dispatch(
            groupsApi.util.invalidateTags(['Groups', 'GroupChallenges']),
          );
        },
      }),
      getFeedbacksForFramework: builder.query<
        FeedbackResult[] | null,
        { id: string }
      >({
        query: params => ({
          url: `/api/feedback?framework_id=${params.id}`,
          method: 'get',
        }),
        providesTags: ['Feedback'],
        transformResponse: r => {
          const anyR = r as any;
          const feedbacks = anyR?.feedback_list || anyR?.feedbacks || [];
          // Map _id to id and ensure it's a string
          return feedbacks.map((f: any) => ({
            ...f,
            id: f.id?.toString() || f._id?.toString() || f.id || f._id,
          }));
        },
      }),
      getFeedbacks: builder.query<FeedbackResult[], void>({
        query: () => ({
          url: '/api/feedback',
          method: 'get',
        }),
        providesTags: ['Feedback'],
        // Backend returns { feedbacks: FeedbackResult[] }
        transformResponse: r => {
          const feedbacks = (r as any).feedbacks || [];
          // Map _id to id and ensure it's a string
          return feedbacks.map((f: any) => ({
            ...f,
            id: f.id?.toString() || f._id?.toString() || f.id || f._id,
          }));
        },
      }),
      getFavourites: builder.query<Favourite[] | null, void>({
        query: () => ({
          url: '/api/favourites',
          method: 'get',
        }),
        providesTags: ['Favourites'],
        transformResponse: r => (r as FavouritesResponse).favourites,
      }),
      getFavouriteDetails: builder.query<
        { id: string; type: string; title: string; shortDescription?: string; heroImageUrl?: string; thumbnailImageUrl?: string }[] | null,
        void
      >({
        query: () => ({
          url: '/api/favourites/details',
          method: 'get',
        }),
        providesTags: ['Favourites'],
        transformResponse: r => (r as { favourites: any[] }).favourites,
      }),
      createFavourite: builder.mutation<
        FavouriteResult,
        {
          type: string;
          frameworkId: string;
        }
      >({
        query: params => ({
          url: '/api/favourites',
          method: 'POST',
          body: {
            type: params.type,
            framework_id: params.frameworkId,
          },
        }),
        invalidatesTags: ['Favourites', 'Stats'],
        transformResponse: r => (r as FavouriteResponse).favourite,
      }),
      deleteFavourite: builder.mutation<void, { id: string }>({
        query: params => {
          return {
            url: `/api/favourites/${params.id}`,
            method: 'DELETE',
          };
        },
        invalidatesTags: ['Favourites', 'Stats'],
      }),
      getStats: builder.query<Stats | null, void>({
        query: () => ({
          url: '/api/analytics/stats',
          method: 'get',
        }),
        providesTags: ['Stats'],
        transformResponse: r => r as Stats,
      }),
    }),
  });

export default trackApi;

export const {
  useCreateFeedbackMutation,
  useUpdateFeedbackMutation,
  useGetFeedbacksForFrameworkQuery,
  useGetFeedbacksQuery,
  useGetFavouritesQuery,
  useGetFavouriteDetailsQuery,
  useCreateFavouriteMutation,
  useDeleteFavouriteMutation,
  useGetStatsQuery,
} = trackApi;

// Stubs for removed surveys - return empty/default data
export const useGetUserTrackSurveysQuery = () => ({ 
  data: [] as Array<{
    co2_savings: number;
    cost_savings: number;
    food_saved: number;
  }>
});
export const useGetUserTrackSurveyEligibilityQuery = () => ({ 
  data: {
    eligible: false,
    next_survey_date: new Date().toISOString(),
  }
});

// Temporary stubs for removed meals endpoints to avoid runtime errors in UI components
export const useGetUserMealsQuery = () => ({ data: [] as any[] });
export const useUpdateUserMealMutation = () => {
  const mutate = async (_params: any) => Promise.resolve();
  return [mutate, { isLoading: false }] as const;
};

// Temporary stub for single meal fetch used by PostMakeScreen
export const useGetUserMealQuery = (params?: { id: string }) => {
  const id = params?.id;
  const meal = id
    ? {
        id,
        framework_id: id,
        data: {
          ingredients: [],
        },
      }
    : undefined;
  return { data: meal as any, isLoading: false, isError: false } as const;
};
