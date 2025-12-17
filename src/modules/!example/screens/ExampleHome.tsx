import tw from '../../../common/tailwind';
import { mixpanelEventName } from '../../../modules/analytics/analytics';
import useAnalytics from '../../../modules/analytics/hooks/useAnalytics';
import { useDeleteSessionMutation } from '../../../modules/auth/api';
import { useRefreshToken } from '../../../modules/auth/hooks/useSessionToken';
import { clearSessionData } from '../../../modules/auth/sessionSlice';
import usePushNotificationToken from '../../../modules/pushNotifications/usePushNotificationToken';
import { Alert, Button, View } from 'react-native';
import { useAppDispatch } from '../../../store/hooks';

export default function ExampleHome() {
  const dispatch = useAppDispatch();
  const [deleteSession, { isLoading: isSigningout }] =
    useDeleteSessionMutation();

  const { token: notification_token } = usePushNotificationToken();
  const refreshToken = useRefreshToken();

  const { sendResetEvent, sendAnalyticsEvent } = useAnalytics();

  const doLogout = async (everywhere: boolean) => {
    try {
      await deleteSession({
        refresh_token: everywhere ? undefined : refreshToken,
        notification_token,
      });

      sendAnalyticsEvent({
        event: mixpanelEventName.userSignedout,
        properties: {
          logout_everywhere: everywhere,
        },
      });

      sendResetEvent();
      await dispatch(clearSessionData());
    } catch {}
  };

  const onLogOutPress = () => {
    Alert.alert(
      'Log out',
      'Do you want to log out of just this device, or everywhere?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            sendAnalyticsEvent({
              event: mixpanelEventName.userCancelSignOut,
            });
          },
        },
        {
          text: 'This device',
          style: 'default',
          onPress: () => doLogout(false),
        },
        {
          text: 'Everywhere',
          style: 'destructive',
          onPress: () => doLogout(true),
        },
      ],
    );
  };
  return (
    <View style={tw`flex flex-1 items-center justify-center bg-green-100`}>
      <Button title="Log out" onPress={onLogOutPress} disabled={isSigningout} />
    </View>
  );
}
