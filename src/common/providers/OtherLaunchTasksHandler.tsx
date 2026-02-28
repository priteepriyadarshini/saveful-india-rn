import useAnalytics from '../../modules/analytics/hooks/useAnalytics';
import { useGetCurrentUserQuery } from '../../modules/auth/api';
import { useRegisterDeviceTokenMutation } from '../../modules/pushNotifications/api';
import usePushNotificationToken from '../../modules/pushNotifications/usePushNotificationToken';
import { pushTokenFromToken } from '../../modules/pushNotifications/helper';
import { TokenManager } from '../../modules/pushNotifications/TokenManager';
import React from 'react';

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

  const { token: pushToken } = usePushNotificationToken();
  const [registerDeviceToken] = useRegisterDeviceTokenMutation();

  React.useEffect(() => {
    if (userError) {
      console.warn('Failed to load current user in OtherLaunchTasksHandler:', userError);
    }
  }, [userError]);


  React.useEffect(() => {
    if (currentUser) {
      TokenManager.shared.checkNotificationPermissions();
    }
  }, [currentUser]);

  // Register device push token with backend whenever user or token changes
  React.useEffect(() => {
    if (!currentUser || !pushToken) return;

    const registerToken = async () => {
      try {
        const tokenPayload = pushTokenFromToken(pushToken);
        console.log('[Notifications] Registering device token with backend...', {
          platform: tokenPayload.platform,
          tokenType: tokenPayload.tokenType,
          tokenPrefix: tokenPayload.token?.substring(0, 20),
        });
        await registerDeviceToken(tokenPayload).unwrap();
        console.log('[Notifications] Device token registered with backend successfully');
      } catch (error) {
        console.error('[Notifications] Failed to register device token:', error);
      }
    };

    registerToken();
  }, [currentUser, pushToken, registerDeviceToken]);

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
      } catch (error) {
        console.error('Error in OtherLaunchTasksHandler:', error);
      }
    };

    sendUserInfoToServer();
  }, [sendAnalyticsUserID, currentUser]);

  return null;
}
