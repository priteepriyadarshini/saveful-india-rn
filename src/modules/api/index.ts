import { createApi } from '@reduxjs/toolkit/query/react';
import baseQueryWithReauth from '../../modules/auth/baseQueryWithReauth';

const baseQuery = baseQueryWithReauth;

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['CurrentUser', 'CurrentUserOnboarding', 'CurrentUserTOTP'],
  endpoints: _builder => ({}),
});

export default api;
