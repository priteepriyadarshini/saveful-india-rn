import useAnalytics from '../../modules/analytics/hooks/useAnalytics';
import { useGetCurrentUserQuery } from '../../modules/auth/api';
import { useSendOneSignalPayloadMutation } from '../../modules/oneSignalNotifications/api';
import { OneSignalPayload } from '../../modules/oneSignalNotifications/types';
import React from 'react';
import { OneSignal } from 'react-native-onesignal';

export default function OtherLaunchTasksHandler() {
  const { sendAnalyticsUserID } = useAnalytics();

  const { data: currentUser, error: userError } = useGetCurrentUserQuery(
    undefined,
    { 
      skip: false,
      refetchOnMountOrArgChange: false,
      refetchOnReconnect: false,
    }
  );
  const [sendOneSignalPayload] = useSendOneSignalPayloadMutation();

  React.useEffect(() => {
    if (userError) {
      console.warn('Failed to load current user in OtherLaunchTasksHandler:', userError);
    }
  }, [userError]);

  React.useEffect(() => {
    const sendUserInfoToServer = async () => {
      if (!currentUser) {
        return;
      }

      try {
        try {
          sendAnalyticsUserID(currentUser.id, {
            id: currentUser.id,
            email: currentUser.email,
          });
        } catch (analyticsError) {
          console.warn('Analytics initialization failed (non-critical):', analyticsError);
        }

        console.log('OneSignal integration disabled in production build');
        
        // // Initialize OneSignal with user information
        // try {
        //   OneSignal.login(currentUser.id);
        //   OneSignal.User.addEmail(currentUser.email);
        //   OneSignal.User.addTag('first_name', currentUser.first_name);

        //   // Retrieve OneSignal detail
        //   const oneSignalId = await OneSignal.User.getOnesignalId();

        //   // Send one signal detail to backend
        //   const serverPayload: OneSignalPayload = {
        //     notification_settings: {
        //       id: currentUser.id,
        //       email: currentUser.email,
        //       firstName: currentUser.first_name,
        //       oneSignalId,
        //     },
        //   };

        //   await sendOneSignalPayload(serverPayload);
        // } catch (oneSignalError) {
        //   console.warn('OneSignal setup failed (non-critical):', oneSignalError);
        // }
      } catch (error) {
        console.error('Error in OtherLaunchTasksHandler:', error);
      }
    };

    sendUserInfoToServer();
  }, [sendAnalyticsUserID, currentUser, sendOneSignalPayload]);

  return null;
}
