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

function getBaseURL() {
  // If you store your base URL somewhere else, you can modify the line below...
  return EnvironmentManager.shared.apiUrl();
}

// create a new mutex so we can prevent multiple requests to the refresh token api
const mutex = new Mutex();

// Base query with dynamic base url
// So we can fetch the base URL from the environment manager
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
  // wait until the mutex is available without locking it
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    // checking whether the mutex is locked
    if (!mutex.isLocked()) {
      // console.debug('Refreshing the access token');
      const release = await mutex.acquire();
      try {
        // Get the current refresh token
        const { refresh_token } = (api.getState() as RootState).session;
        // Setup the query params
        const refreshQuery = {
          url: '/api/session',
          method: 'patch',
          body: {
            refresh_token,
          },
        };
        // Try and refresh the token
        const refreshResult = await baseQuery(refreshQuery, api, {
          ...extraOptions,
          noAuth: true,
        });
        // console.log('Refresh result', refreshResult);
        if (refreshResult.data) {
          // Update the store with the new session data - note the AWAIT so it will be completed before we
          // try the query again
          await api.dispatch(
            saveSessionData((refreshResult.data as DataResponse<Session>).data),
          );
          // retry the initial query
          result = await baseQuery(args, api, extraOptions);
        } else {
          if (refreshResult.error?.status === 401) {
            // If we get a 401 while trying to refresh the token, clear the session data
            await api.dispatch(clearSessionData());
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
