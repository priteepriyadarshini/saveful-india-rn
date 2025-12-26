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

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  phoneNumber?: string;
  stateCode?: string;
  vegType?: string;
  dairyFree?: boolean;
  nutFree?: boolean;
  glutenFree?: boolean;
  hasDiabetes?: boolean;
  otherAllergies?: string[];
}

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    name: string;
    phoneNumber?: string;
  };
}

export interface DietaryProfileUpdate {
  vegType: 'OMNI' | 'VEGETARIAN' | 'VEGAN';
  dairyFree?: boolean;
  nutFree?: boolean;
  glutenFree?: boolean;
  hasDiabetes?: boolean;
}

const currentUserApi = api
  .enhanceEndpoints({
    addTagTypes: ['SessionTokens'],
  })
  .injectEndpoints({
    overrideExisting: true,
    endpoints: builder => ({
      // New login endpoint for NestJS backend
      login: builder.mutation<AuthResponse, LoginCredentials>({
        query: credentials => ({
          url: '/api/auth/login',
          method: 'POST',
          body: credentials,
        }),
      }),

      // New signup endpoint for NestJS backend
      signup: builder.mutation<AuthResponse, SignupData>({
        query: data => ({
          url: '/api/auth/signup',
          method: 'POST',
          body: data,
        }),
      }),

      // Refresh token endpoint
      refreshToken: builder.mutation<AuthResponse, { refreshToken: string }>({
        query: ({ refreshToken }) => ({
          url: '/api/auth/refresh',
          method: 'POST',
          body: { refreshToken },
        }),
      }),

      getCurrentUser: builder.query<
        CurrentUser | null,
        { accessToken?: string } | void
      >({
        query: params => ({
          url: '/api/auth/me',
          method: 'get',
          headers: params?.accessToken
            ? { authorization: `Bearer ${params?.accessToken}` }
            : undefined,
        }),
        providesTags: ['CurrentUser'],
        transformResponse: (r: any) => {
          // Transform backend response to match CurrentUser model
          console.log('getCurrentUser response:', r);
          if (!r) return null;
          return {
            id: r.id,
            email: r.email,
            first_name: r.name || '',
            phone_number: r.phoneNumber || '',
            ...r,
          } as CurrentUser;
        },
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

      updateDietaryProfile: builder.mutation<CurrentUser, DietaryProfileUpdate>({
        query: (data) => ({
          url: '/api/auth/dietary-profile',
          method: 'PUT',
          body: data,
        }),
        invalidatesTags: ['CurrentUser'],
        transformResponse: (r: any) => {
          console.log('updateDietaryProfile response:', r);
          if (!r) return null;
          return {
            id: r.id,
            email: r.email,
            first_name: r.name || '',
            phone_number: r.phoneNumber || '',
            ...r,
          } as CurrentUser;
        },
        async onQueryStarted(_, { dispatch, queryFulfilled }) {
          try {
            await queryFulfilled;
            // Refetch current user to get updated dietary profile
            dispatch(currentUserApi.util.invalidateTags(['CurrentUser']));
          } catch {
            // Handle error if needed
          }
        },
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
  useLoginMutation,
  useSignupMutation,
  useRefreshTokenMutation,
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
  useUpdateDietaryProfileMutation,
  useDeleteSessionMutation,
  useListSessionsQuery,
  useUpdateCurrentUserPasswordMutation,
} = currentUserApi;
