import api from '../../modules/api';
import { PushToken } from '../../modules/pushNotifications/types';

const pushTokenApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    registerDeviceToken: builder.mutation<{ message: string }, PushToken>({
      query: token => ({
        url: '/api/notifications/token',
        method: 'POST',
        body: token,
      }),
    }),

    unregisterDeviceToken: builder.mutation<{ message: string }, { token: string }>({
      query: params => ({
        url: '/api/notifications/token',
        method: 'DELETE',
        body: params,
      }),
    }),
  }),
});

export default pushTokenApi;

export const {
  useRegisterDeviceTokenMutation,
  useUnregisterDeviceTokenMutation,
} = pushTokenApi;
