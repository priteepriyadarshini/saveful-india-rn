import api from '../../api';
import { Ingredient, IngredientCategory } from './types';

const ingredientsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // country is optional — when provided the backend server-side filters by country
    getAllIngredients: builder.query<Ingredient[], string | undefined>({
      query: (country) =>
        country
          ? `/api/ingredients?country=${encodeURIComponent(country)}`
          : '/api/ingredients',
      keepUnusedDataFor: 300, // 5 minutes — avoids re-fetching on every screen visit
    }),
    getIngredientById: builder.query<Ingredient, string>({
      query: (id) => `/api/ingredients/${id}`,
      keepUnusedDataFor: 300,
    }),
    getAllIngredientCategories: builder.query<IngredientCategory[], void>({
      query: () => '/api/ingredients/category',
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllIngredientsQuery,
  useGetIngredientByIdQuery,
  useGetAllIngredientCategoriesQuery,
} = ingredientsApi;

export default ingredientsApi;
