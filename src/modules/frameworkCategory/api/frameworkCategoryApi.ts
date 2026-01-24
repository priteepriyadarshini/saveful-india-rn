import api from '../../api';
import { FrameworkCategory } from './frameworkCategoryApiService';

const frameworkCategoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllFrameworkCategories: builder.query<FrameworkCategory[], void>({
      query: () => '/api/framework-category',
    }),
    getFrameworkCategoryById: builder.query<FrameworkCategory, string>({
      query: (id) => `/api/framework-category/${id}`,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllFrameworkCategoriesQuery,
  useGetFrameworkCategoryByIdQuery,
} = frameworkCategoryApi;

export default frameworkCategoryApi;
