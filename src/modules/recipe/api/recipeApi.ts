import api from '../../api';
import { Recipe, PopulatedRecipe } from '../models/recipe';

export interface DietaryRecommendationsParams {
  vegType?: string;
  dairyFree?: boolean;
  nutFree?: boolean;
  glutenFree?: boolean;
  hasDiabetes?: boolean;
  country?: string;
}

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
    getDietaryRecommendations: builder.query<Recipe[], DietaryRecommendationsParams>({
      query: (params) => {
        const qs = new URLSearchParams();
        if (params.vegType)                      qs.set('vegType',     params.vegType);
        // Always send boolean flags explicitly (even false) so the backend
        // doesn't silently merge the stored user dietary profile on top.
        if (params.dairyFree  !== undefined)     qs.set('dairyFree',   String(params.dairyFree));
        if (params.nutFree    !== undefined)     qs.set('nutFree',     String(params.nutFree));
        if (params.glutenFree !== undefined)     qs.set('glutenFree',  String(params.glutenFree));
        if (params.hasDiabetes !== undefined)    qs.set('hasDiabetes', String(params.hasDiabetes));
        if (params.country)                      qs.set('country',     params.country);
        const query = qs.toString();
        return `/api/api/recipe/dietary-recommendations${query ? `?${query}` : ''}`;
      },
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
  useGetDietaryRecommendationsQuery,
} = recipeApi;

export default recipeApi;
