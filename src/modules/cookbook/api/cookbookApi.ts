import api from '../../api';
import {
  UserRecipe,
  UserRecipesResponse,
  UserRecipeByIdResponse,
  AddRecipeRequest,
  AddRecipeResponse,
  DeleteRecipeResponse,
} from '../models/userRecipe';

const COOKBOOK_API_PATH = '/api/cookbookai';
const LOCAL_PENDING_TTL_MS = 5 * 60 * 1000;

let localPendingRecipes: UserRecipe[] = [];

function pruneLocalPending() {
  const now = Date.now();
  localPendingRecipes = localPendingRecipes.filter((recipe) => {
    const createdAtMs = new Date(recipe.createdAt || 0).getTime();
    return Number.isFinite(createdAtMs) && now - createdAtMs < LOCAL_PENDING_TTL_MS;
  });
}

function saveLocalPending(recipe: UserRecipe) {
  pruneLocalPending();
  localPendingRecipes = [recipe, ...localPendingRecipes.filter((r) => r._id !== recipe._id)];
}

function removeLocalPendingById(id: string) {
  localPendingRecipes = localPendingRecipes.filter((r) => r._id !== id);
}

function mergeServerWithLocalPending(serverRecipes: UserRecipe[]) {
  pruneLocalPending();

  // Remove local placeholders whose real counterpart already arrived from the
  // server (matched by _id) or when the server already has an accepted recipe
  // — meaning generation is done and we no longer need the placeholder.
  const serverIds = new Set(serverRecipes.map((r) => r._id));
  const hasAcceptedRecipe = serverRecipes.some((r) => r.status === 'accepted');

  localPendingRecipes = localPendingRecipes.filter((localRecipe) => {
    // Server already returned this exact row (pending or accepted) — drop local copy
    if (serverIds.has(localRecipe._id)) return false;
    // If server has any accepted recipe that was not there before, the generation
    // likely finished — drop temp placeholders (ids starting with "pending-")
    if (hasAcceptedRecipe && localRecipe._id.startsWith('pending-')) return false;
    return true;
  });

  const remainingLocalIds = new Set(localPendingRecipes.map((r) => r._id));
  const pendingNotInServer = localPendingRecipes.filter((r) => !serverIds.has(r._id));
  return [...pendingNotInServer, ...serverRecipes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

const cookbookApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUserRecipes: builder.query<UserRecipe[], void>({
      query: () => '/api/cookbookai/recipes',
      transformResponse: (response: UserRecipesResponse) =>
        mergeServerWithLocalPending(response.data ?? []),
      providesTags: ['CookbookRecipes'],
      keepUnusedDataFor: 60,
    }),

    getUserRecipeById: builder.query<UserRecipe | null, string>({
      query: (id) => `/api/cookbookai/recipes/${id}`,
      transformResponse: (response: UserRecipeByIdResponse) => response.data ?? null,
      keepUnusedDataFor: 120,
    }),

    addRecipeFromLink: builder.mutation<AddRecipeResponse, AddRecipeRequest>({
      query: (body) => ({
        url: `${COOKBOOK_API_PATH}/add-recipe`,
        method: 'POST',
        body,
      }),
     
      async onQueryStarted(body, { dispatch, queryFulfilled, getState }) {
    
        const tempId = `pending-${Date.now()}`;
        const now = new Date().toISOString();
        const placeholder: UserRecipe = {
          _id: tempId,
          userid: '',
          status: 'pending',
          title: body.message, 
          shortDescription: '',
          longDescription: '',
          hackOrTipIds: [],
          heroImageUrl: undefined,
          youtubeId: undefined,
          portions: '',
          prepCookTime: 0,
          frameworkCategories: [],
          useLeftoversIn: [],
          components: [],
          isActive: false,
          countries: [],
          createdAt: now,
          updatedAt: now,
        };

        saveLocalPending(placeholder);

        const selectUserRecipes = cookbookApi.endpoints.getUserRecipes.select(undefined);
        const existingRecipes = selectUserRecipes(getState())?.data ?? [];
        const seededRecipes = [
          placeholder,
          ...existingRecipes.filter((recipe) => recipe._id !== tempId),
        ];

        dispatch(cookbookApi.util.upsertQueryData('getUserRecipes', undefined, seededRecipes));

        try {
          const { data: result } = await queryFulfilled;
          if (result.success && result.queued) {
            if (result.data) {
              removeLocalPendingById(tempId);
              dispatch(
                cookbookApi.util.updateQueryData('getUserRecipes', undefined, (draft) => {
                  const idx = draft.findIndex((r) => r._id === tempId);
                  if (idx !== -1) {
                    draft.splice(idx, 1, result.data!);
                  } else if (!draft.some((r) => r._id === result.data!._id)) {
                    draft.unshift(result.data!);
                  }
                }),
              );
            }
           
          } else {
            removeLocalPendingById(tempId);
            dispatch(
              cookbookApi.util.updateQueryData('getUserRecipes', undefined, (draft) => {
                const idx = draft.findIndex((r) => r._id === tempId);
                if (idx !== -1) {
                  draft.splice(idx, 1);
                }
              }),
            );
          }
        } catch {
          removeLocalPendingById(tempId);
          dispatch(
            cookbookApi.util.updateQueryData('getUserRecipes', undefined, (draft) => {
              const idx = draft.findIndex((r) => r._id === tempId);
              if (idx !== -1) {
                draft.splice(idx, 1);
              }
            }),
          );
        }
      },
    
    }),

    deleteCookbookRecipe: builder.mutation<DeleteRecipeResponse, string>({
      query: (id) => ({
        url: `/api/cookbookai/recipes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CookbookRecipes'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetUserRecipesQuery,
  useGetUserRecipeByIdQuery,
  useAddRecipeFromLinkMutation,
  useDeleteCookbookRecipeMutation,
} = cookbookApi;

export default cookbookApi;
