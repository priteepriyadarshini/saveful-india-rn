import useAnalytics from '../../modules/analytics/hooks/useAnalytics';
import { useGetCurrentUserQuery } from '../../modules/auth/api';
import { useSendOneSignalPayloadMutation } from '../../modules/oneSignalNotifications/api';
import { OneSignalPayload } from '../../modules/oneSignalNotifications/types';
import React from 'react';
import { OneSignal } from 'react-native-onesignal';

export default function OtherLaunchTasksHandler() {
  const { sendAnalyticsUserID } = useAnalytics();

  const { data: currentUser } = useGetCurrentUserQuery();
  const [sendOneSignalPayload] = useSendOneSignalPayloadMutation();

  React.useEffect(() => {
    const sendUserInfoToServer = async () => {
      if (currentUser) {
        // Initialize OneSignal with user information
        OneSignal.login(currentUser.id);
        OneSignal.User.addEmail(currentUser.email);
        OneSignal.User.addTag('first_name', currentUser.first_name);

        // Retrieve OneSignal detail
        const oneSignalId = await OneSignal.User.getOnesignalId();

        // Send one signal detail to backend
        const serverPayload: OneSignalPayload = {
          notification_settings: {
            id: currentUser.id,
            email: currentUser.email,
            firstName: currentUser.first_name,
            oneSignalId,
          },
        };

        await sendOneSignalPayload(serverPayload);

        sendAnalyticsUserID(currentUser.id, {
          id: currentUser.id,
          email: currentUser.email,
        });
      }
    };

    sendUserInfoToServer();
  }, [sendAnalyticsUserID, currentUser, sendOneSignalPayload]);

  return null;
}
