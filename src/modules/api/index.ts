import { createApi } from '@reduxjs/toolkit/query/react';
import baseQueryWithReauth from '../../modules/auth/baseQueryWithReauth';

// Base query that re-authenticates on 401
const baseQuery = baseQueryWithReauth;

// Define a service using a base URL and expected endpoints
export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['CurrentUser', 'CurrentUserOnboarding', 'CurrentUserTOTP'],
  endpoints: _builder => ({}),
});

export default api;
