// Context object that vends the current EnvironmentType and EnvironmentConfiguration from EnvironmentManager
import useAccessToken from '../../../modules/auth/hooks/useSessionToken';
import { useSendPushNotificationTokenMutation } from '../../../modules/pushNotifications/api';
import { pushTokenFromToken } from '../../../modules/pushNotifications/helper';
import usePushNotificationToken from '../../../modules/pushNotifications/usePushNotificationToken';
import React from 'react';

import EnvironmentManager, {
  EnvironmentManagerEvents,
} from '../environmentManager';
import { EnvironmentConfiguration, EnvironmentType } from '../types';

interface EnvironmentContextValue {
  environment: EnvironmentType;
  configuration: EnvironmentConfiguration;
  useBundledContent: boolean;
  setUseBundledContent: (value: boolean) => void;
}

const DefaultContextValue = {
  environment: EnvironmentType.Production,
  configuration: {
    title: '',
    apiUrl: '',
    webUrl: '',
    socketUrl: '',
    supportEmail: '',
    mixpanelToken: '',
  },
  useBundledContent: true,
  setUseBundledContent: () => Promise.resolve(),
};

const EnvironmentContext =
  React.createContext<EnvironmentContextValue>(DefaultContextValue);

function EnvironmentProvider({ children }: { children: React.ReactNode }) {
  // Set the current values from the EnvironmentManager
  const [state, setState] = React.useState<EnvironmentConfiguration>(
    EnvironmentManager.shared.getConfiguration()?? DefaultContextValue.configuration ,
  );
  const [env, setEnv] = React.useState<EnvironmentType>(
    EnvironmentManager.shared.getEnvironment(),
  );

  const [useBundledContent, setUseBundledContent] = React.useState<boolean>(
    EnvironmentManager.shared.getUseBundledContent(),
  );

  // Update the environment and configuration when the environment changes
  const onConfigurationChanged = React.useCallback(
    (
      newEnvironment: EnvironmentType,
      newConfiguration: EnvironmentConfiguration,
    ) => {
      // console.debug('Environment changed in context', { newConfiguration });
      setState(newConfiguration);
      setEnv(newEnvironment);
    },
    [],
  );

  // Listen for config changes
  React.useEffect(() => {
    EnvironmentManager.shared.addListener(
      EnvironmentManagerEvents.ConfigurationChanged,
      onConfigurationChanged,
    );

    return () => {
      EnvironmentManager.shared.removeListener(
        EnvironmentManagerEvents.ConfigurationChanged,
        onConfigurationChanged,
      );
    };
  }, [onConfigurationChanged]);

  const value = React.useMemo(() => {
    return {
      configuration: state,
      environment: env,
      useBundledContent,
      setUseBundledContent,
    };
  }, [env, state, useBundledContent]);

  // Push notifications
  const { token } = usePushNotificationToken();
  const [sendPushNotificationToken] = useSendPushNotificationTokenMutation();
  const accessToken = useAccessToken();

  // Send updated tokens to the server when the token or access token changes
  React.useEffect(() => {
    // This will send the tokens slightly more often than we need to
    // but it should be fine. Probably for the best as we don't
    // really have an error handling situation for if this request fails.
    if (token && accessToken) {
      sendPushNotificationToken(pushTokenFromToken(token));
    }
  }, [token, accessToken, sendPushNotificationToken]);

  return (
    <EnvironmentContext.Provider value={value}>
      {children}
    </EnvironmentContext.Provider>
  );
}

export { EnvironmentContext, EnvironmentProvider };