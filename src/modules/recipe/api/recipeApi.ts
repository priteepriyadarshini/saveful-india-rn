import api from '../../api';
import { Recipe, PopulatedRecipe } from '../models/recipe';

const recipeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllRecipes: builder.query<Recipe[], void>({
      query: () => '/api/api/recipe',
    }),
    getRecipeById: builder.query<PopulatedRecipe, string>({
      query: (id) => `/api/api/recipe/${id}`,
    }),
    getRecipesByCategory: builder.query<Recipe[], string>({
      query: (categoryId) => `/api/api/recipe/category/${categoryId}`,
    }),
    getRecipesByIngredient: builder.query<Recipe[], string>({
      query: (ingredientId) => `/api/api/recipe/ingredient/${ingredientId}`,
    }),
    getRecipesByIngredients: builder.query<Recipe[], { ingredientIds: string[]; country?: string }>({
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        const ingredientIds: string[] = arg?.ingredientIds ?? [];
        const country: string | undefined = arg?.country;
        try {
          // Fetch recipes for each ingredient
          const recipesByIngredient = await Promise.all(
            ingredientIds.map(async (ingredientId) => {
              const params = country ? `?country=${encodeURIComponent(country)}` : '';
              const result = await fetchWithBQ(`/api/api/recipe/ingredient/${ingredientId}${params}`);
              if (result.error) throw result.error;
              return result.data as Recipe[];
            })
          );

          // Flatten and deduplicate recipes
          const allRecipes = recipesByIngredient.flat();
          const uniqueRecipes = Array.from(
            new Map(allRecipes.map(recipe => [recipe._id, recipe])).values()
          );

          return { data: uniqueRecipes };
        } catch (error) {
          return { error: error as any };
        }
      },
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAllRecipesQuery,
  useGetRecipeByIdQuery,
  useGetRecipesByCategoryQuery,
  useGetRecipesByIngredientQuery,
  useGetRecipesByIngredientsQuery,
} = recipeApi;

export default recipeApi;
