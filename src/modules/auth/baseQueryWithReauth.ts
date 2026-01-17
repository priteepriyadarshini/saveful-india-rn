import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import { Mutex } from 'async-mutex';
import { Session } from '../../models/Session';
import { DataResponse } from '../api/types';
import { clearSessionData, saveSessionData } from './sessionSlice';
import EnvironmentManager from '../environment/environmentManager';
import { RootState } from '../../store/store';
import { CommonActions } from '@react-navigation/native';

function getBaseURL() {
  const url = EnvironmentManager.shared.apiUrl();
  return url;
}

const mutex = new Mutex();


const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  { noAuth?: boolean } | undefined
> = async (args, WebApi, extraOptions) => {
  const rawBaseQuery = fetchBaseQuery({
    baseUrl: getBaseURL(),
    prepareHeaders: (headers, { getState }) => {
      const { access_token } = (getState() as RootState).session;
      if (access_token && !extraOptions?.noAuth) {
        headers.set('authorization', `Bearer ${access_token}`);
      }
      return headers;
    },
  });
  return rawBaseQuery(args, WebApi, extraOptions ?? {});
};

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const { refresh_token } = (api.getState() as RootState).session;
        // Setup the query params
        const refreshQuery = {
          url: '/api/auth/refresh',
          method: 'POST',
          body: {
            refreshToken: refresh_token,
          },
        };
        // Try and refresh the token
        const refreshResult = await baseQuery(refreshQuery, api, {
          ...extraOptions,
          noAuth: true,
        });
        // console.log('Refresh result', refreshResult);
        if (refreshResult.data) {
          // Transform the response to match Session interface
          const authResponse = refreshResult.data as any;
          const sessionData = {
            access_token: authResponse.accessToken,
            refresh_token: authResponse.refreshToken,
          };
          // Update the store with the new session data
          await api.dispatch(saveSessionData(sessionData));
          // retry the initial query
          result = await baseQuery(args, api, extraOptions);
        } else {
          if (refreshResult.error?.status === 401) {
            // If we get a 401 while trying to refresh the token, clear the session data
            console.log('Refresh token failed - clearing session and logging out');
            await api.dispatch(clearSessionData());
            // Session will be cleared, and useAuthListener will handle navigation to Intro
          }
        }
      } finally {
        // release must be called once the mutex should be released again.
        release();
      }
    } else {
      // wait until the mutex is available without locking it
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }
  return result;
};

export default baseQueryWithReauth;
