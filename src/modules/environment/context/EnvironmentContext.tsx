// Context object that vends the current EnvironmentType and EnvironmentConfiguration from EnvironmentManager
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

  return (
    <EnvironmentContext.Provider value={value}>
      {children}
    </EnvironmentContext.Provider>
  );
}

export { EnvironmentContext, EnvironmentProvider };