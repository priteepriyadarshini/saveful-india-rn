import api from '../../api';
import { Ingredient, IngredientCategory } from './types';

const ingredientsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllIngredients: builder.query<Ingredient[], void>({
      query: () => '/api/ingredients',
    }),
    getIngredientById: builder.query<Ingredient, string>({
      query: (id) => `/api/ingredients/${id}`,
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
