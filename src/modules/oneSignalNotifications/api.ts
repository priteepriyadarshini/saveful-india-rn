import api from '../api';
import { OneSignalPayload } from './types';

const oneSignalApi = api
  .enhanceEndpoints({
    addTagTypes: ['UserNotifications'],
  })
  .injectEndpoints({
    overrideExisting: true,
    endpoints: builder => ({
      sendOneSignalPayload: builder.mutation<void, OneSignalPayload>({
        query: params => ({
          url: 'current_user/notifications',
          method: 'POST',
          body: params,
        }),
      }),
    }),
  });

export default oneSignalApi;

export const { useSendOneSignalPayloadMutation } = oneSignalApi;
