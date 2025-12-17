import { CurrentUser, CurrentUserTOTP } from '../../models/Session';
import api from '../api';
import { DataResponse } from '../../modules/api/types';

export interface SessionToken {
  id: string;
  aud?: string;
  updated_at: number;
  device?: string;
  client?: string;
  is_current?: boolean;
}

const currentUserApi = api
  .enhanceEndpoints({
    addTagTypes: ['SessionTokens'],
  })
  .injectEndpoints({
    overrideExisting: true,
    endpoints: builder => ({
      getCurrentUser: builder.query<
        CurrentUser | null,
        { accessToken?: string } | void
      >({
        query: params => ({
          url: '/api/current_user',
          method: 'get',
          headers: params?.accessToken
            ? { authorization: `Bearer ${params?.accessToken}` }
            : undefined,
          params: {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        }),
        providesTags: ['CurrentUser'],
        transformResponse: r => (r as DataResponse<CurrentUser | null>).data,
      }),

      createCurrentUserTOTP: builder.mutation<
        CurrentUserTOTP,
        { secret: string; totp_code: string; accessToken?: string } | void
      >({
        query: params => ({
          url: '/api/current_user/totp',
          method: 'POST',
          body: params,
          headers: params?.accessToken
            ? { authorization: `Bearer ${params?.accessToken}` }
            : undefined,
        }),
        invalidatesTags: ['CurrentUserTOTP'],
        transformResponse: r => (r as DataResponse<CurrentUserTOTP>).data,
      }),

      getCurrentUserTOTP: builder.query<
        CurrentUserTOTP,
        { accessToken?: string } | void
      >({
        query: params => ({
          url: '/api/current_user/totp',
          method: 'get',
          headers: params?.accessToken
            ? { authorization: `Bearer ${params?.accessToken}` }
            : undefined,
        }),
        providesTags: ['CurrentUserTOTP'],
        transformResponse: r => (r as DataResponse<CurrentUserTOTP>).data,
      }),

      deleteCurrentUserTOTP: builder.mutation<
        CurrentUserTOTP,
        { accessToken?: string } | void
      >({
        query: params => ({
          url: '/api/current_user/totp',
          method: 'DELETE',
          headers: params?.accessToken
            ? { authorization: `Bearer ${params?.accessToken}` }
            : undefined,
        }),
        invalidatesTags: ['CurrentUserTOTP'],
        transformResponse: r => (r as DataResponse<CurrentUserTOTP>).data,
      }),

      updateCurrentUser: builder.mutation<CurrentUser, CurrentUser>({
        query: params => ({
          url: '/api/current_user',
          method: 'PUT',
          body: params,
        }),
        invalidatesTags: ['CurrentUser'],
        transformResponse: r => (r as DataResponse<CurrentUser>).data,
      }),

      updateCurrentUserPassword: builder.mutation<
        CurrentUser,
        {
          currentPassword: string;
          newPassword: string;
          confirmNewPassword: string;
        }
      >({
        query: ({ currentPassword, newPassword, confirmNewPassword }) => ({
          url: '/api/current_user',
          method: 'PUT',
          body: {
            current_password: currentPassword,
            update_password: {
              password: newPassword,
              password_confirmation: confirmNewPassword,
            },
          },
        }),
        invalidatesTags: ['CurrentUser'],
        transformResponse: r => (r as DataResponse<CurrentUser>).data,
      }),

      updateCurrentUserEmail: builder.mutation<CurrentUser, { email: string }>({
        query: params => ({
          url: '/api/current_user/update_email',
          method: 'POST',
          body: params,
        }),
        invalidatesTags: ['CurrentUser'],
        transformResponse: r => (r as DataResponse<CurrentUser>).data,
      }),

      updateCurrentUserTimezone: builder.mutation<
        CurrentUser,
        { timezone: string }
      >({
        query: params => ({
          url: '/api/current_user/update_timezone',
          method: 'POST',
          body: params,
        }),
        invalidatesTags: ['CurrentUser'],
        transformResponse: r => (r as DataResponse<CurrentUser>).data,
      }),

      deleteCurrentUser: builder.mutation<void, void>({
        query: () => ({
          url: '/api/current_user',
          method: 'DELETE',
        }),
      }),

      deleteSession: builder.mutation<
        void,
        { refresh_token?: string; id?: string; notification_token?: string }
      >({
        query: params => {
          return {
            url: '/api/session',
            method: 'DELETE',
            body: params,
          };
        },
        invalidatesTags: ['SessionTokens'],
      }),

      listSessions: builder.query<
        DataResponse<SessionToken[]>,
        { refresh_token?: string }
      >({
        query: params => {
          const searchParams = new URLSearchParams();
          if (params.refresh_token) {
            searchParams.set('refresh_token', params.refresh_token);
          }
          return {
            url: `/api/session?${searchParams.toString()}`,
          };
        },
        providesTags: ['SessionTokens'],
      }),
    }),
  });

export const {
  useGetCurrentUserQuery,
  useLazyGetCurrentUserQuery,
  useCreateCurrentUserTOTPMutation,
  useGetCurrentUserTOTPQuery,
  useLazyGetCurrentUserTOTPQuery,
  useDeleteCurrentUserTOTPMutation,
  useUpdateCurrentUserMutation,
  useUpdateCurrentUserEmailMutation,
  useUpdateCurrentUserTimezoneMutation,
  useDeleteCurrentUserMutation,
  useDeleteSessionMutation,
  useListSessionsQuery,
  useUpdateCurrentUserPasswordMutation,
} = currentUserApi;
