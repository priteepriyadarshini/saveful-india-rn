import {
  TokenManager,
  TokenManagerEvents,
} from '../../modules/pushNotifications/TokenManager';
import React from 'react';

export default function usePushNotificationToken() {
  const [token, setToken] = React.useState<string | undefined>(
    TokenManager.shared.getToken(),
  );

  // Update the environment and configuration when the environment changes
  const onTokenChanged = React.useCallback((newToken?: string) => {
    setToken(newToken);
  }, []);

  // Listen for token changes
  React.useEffect(() => {
    TokenManager.shared.addListener(
      TokenManagerEvents.TokenChanged,
      onTokenChanged,
    );

    return () => {
      TokenManager.shared.removeListener(
        TokenManagerEvents.TokenChanged,
        onTokenChanged,
      );
    };
  }, [onTokenChanged]);

  return { token };
}
