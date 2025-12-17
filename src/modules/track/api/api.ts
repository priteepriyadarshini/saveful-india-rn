import api from '../../../modules/api';
import groupsApi from '../../../modules/groups/api/api';
//import qantasApi from 'modules/qantas/api/api';
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
  SurveyEligibilityResponse,
  SurveyResponse,
  SurveyResult,
  UserMeal,
  UserMealResponse,
  UserMealResult,
  UserMealsResponse,
  UserSurveysResponse,
} from '../../../modules/track/api/types';

const trackApi = api
  .enhanceEndpoints({
    addTagTypes: ['Surveys', 'Feedback', 'UserMeals', 'Favourites', 'Stats'],
  })
  .injectEndpoints({
    overrideExisting: true,
    endpoints: builder => ({
      getUserTrackSurveys: builder.query<SurveyResult[] | null, void>({
        query: () => ({
          url: '/api/surveys',
          method: 'get',
        }),
        providesTags: ['Surveys'],
        transformResponse: r => (r as UserSurveysResponse).track_surveys,
      }),
      createUserTrackSurvey: builder.mutation<
        SurveyResult,
        {
          cookingFrequency: number;
          scraps: number;
          uneatenLeftovers: number;
          binnedFruit: number;
          binnedVeggies: number;
          binnedDairy: number;
          binnedBread: number;
          binnedMeat: number;
          binnedHerbs: number;
          preferredIngredients: (string | undefined)[];
          noOfCooks: number;
          promptAt?: string;
        }
      >({
        query: params => ({
          url: '/api/surveys',
          method: 'POST',
          body: {
            cooking_frequency: params.cookingFrequency,
            scraps: params.scraps,
            uneaten_leftovers: params.uneatenLeftovers,
            binned_items: {
              fruit: params.binnedFruit,
              veggies: params.binnedVeggies,
              dairy: params.binnedDairy,
              bread: params.binnedBread,
              meat: params.binnedMeat,
              herbs: params.binnedHerbs,
            },
            preferred_ingredients: params.preferredIngredients,
            no_of_cooks: params.noOfCooks,
            prompt_at: params.promptAt,
          },
        }),
        invalidatesTags: ['Surveys', 'Stats'],
        transformResponse: r => (r as SurveyResponse).track_survey,
        onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
          await queryFulfilled;
          //dispatch(qantasApi.util.invalidateTags(['Qantas']));  //Uncomment if Qantas page is created
        },
      }),
      getUserTrackSurveyEligibility: builder.query<
        SurveyEligibilityResponse | null,
        void
      >({
        query: () => ({
          url: '/api/surveys/eligibility',
          method: 'get',
        }),
        providesTags: ['Surveys'],
        transformResponse: r => r as SurveyEligibilityResponse,
      }),
      createFeedback: builder.mutation<
        FeedbackResult,
        {
          frameworkId: string;
          prompted: boolean;
          didYouLikeIt?: boolean;
          foodSaved: number;
          mealId: string;
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
        transformResponse: r =>
          (r as FeedbacksForFrameworkResponse).feedback_list,
      }),
      getUserMeals: builder.query<UserMealResult[] | null, void>({
        query: () => ({
          url: '/api/meals',
          method: 'get',
        }),
        providesTags: ['UserMeals'],
        transformResponse: r => (r as UserMealsResponse).meals,
      }),
      createUserMeal: builder.mutation<
        UserMealResult,
        {
          frameworkId: string;
          variantId: string;
          saved: boolean;
          completed: boolean;
          data?: {
            ingredients: string[][];
          };
        }
      >({
        query: params => ({
          url: '/api/meals',
          method: 'POST',
          body: {
            framework_id: params.frameworkId,
            variant_id: params.variantId,
            saved: params.saved,
            completed: params.completed,
            data: params.data,
          },
        }),
        invalidatesTags: ['UserMeals', 'Stats'],
        transformResponse: r => (r as UserMealResponse).meal,
      }),
      getUserMeal: builder.query<UserMealResult | null, { id: string }>({
        query: params => ({
          url: `/api/meals/${params.id}`,
          method: 'get',
        }),
        providesTags: ['UserMeals'],
        transformResponse: r => (r as UserMealResponse).meal,
      }),
      updateUserMeal: builder.mutation<
        UserMeal,
        {
          id: string;
          completed?: boolean;
          saved?: boolean;
          data?: {
            ingredients?: string[][];
          };
        }
      >({
        query: params => ({
          url: `/api/meals/${params.id}/update`,
          method: 'POST',
          body: {
            completed: params.completed,
            saved: params.saved,
            data: params.data,
          },
        }),
        invalidatesTags: ['UserMeals', 'Stats'],
        transformResponse: r => (r as UserMealResponse).meal,
      }),
      getFavourites: builder.query<Favourite[] | null, void>({
        query: () => ({
          url: '/api/favourites',
          method: 'get',
        }),
        providesTags: ['Favourites'],
        transformResponse: r => (r as FavouritesResponse).favourites,
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
          url: '/api/stats',
          method: 'get',
        }),
        providesTags: ['Stats'],
        transformResponse: r => (r as StatsResponse).stats,
      }),
    }),
  });

export default trackApi;

export const {
  useGetUserTrackSurveysQuery,
  useCreateUserTrackSurveyMutation,
  useGetUserTrackSurveyEligibilityQuery,
  useCreateFeedbackMutation,
  useUpdateFeedbackMutation,
  useGetFeedbacksForFrameworkQuery,
  useCreateUserMealMutation,
  useGetUserMealsQuery,
  useGetUserMealQuery,
  useUpdateUserMealMutation,
  useGetFavouritesQuery,
  useCreateFavouriteMutation,
  useDeleteFavouriteMutation,
  useGetStatsQuery,
} = trackApi;
