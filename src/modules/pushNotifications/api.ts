import api from '../../modules/api';
import { PushToken } from '../../modules/pushNotifications/types';

const pushTokenApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    sendPushNotificationToken: builder.mutation<void, PushToken>({
      query: token => ({
        url: '/api/push_tokens',
        method: 'POST',
        body: token,
      }),
    }),

    testMessage: builder.mutation<void, { token: string; message: string }>({
      query: params => ({
        url: '/api/push_tokens/test_message',
        method: 'POST',
        body: params,
      }),
    }),
  }),
});

export default pushTokenApi;

export const { useSendPushNotificationTokenMutation, useTestMessageMutation } =
  pushTokenApi;
