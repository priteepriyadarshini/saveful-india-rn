import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import {
  EnvironmentConfiguration,
  EnvironmentType,
  EnvPersistanceKey,
  PlatformEnvironmentConfiguration,
} from '../../modules/environment/types';
import { Platform } from 'react-native';

class SimpleEventEmitter {
  private listeners: Map<string, Set<Function>> = new Map();

  addListener(event: string, listener: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(listener);
  }

  removeListener(event: string, listener: Function) {
    this.listeners.get(event)?.delete(listener);
  }

  emit(event: string, ...args: any[]) {
    this.listeners.get(event)?.forEach(listener => {
      try {
        listener(...args);
      } catch (error) {
        console.warn('Error in event listener:', error);
      }
    });
  }
}

export function nameForEnvironmentType(env: EnvironmentType) {
  switch (env) {
    case EnvironmentType.Local: {
      return 'Local';
    }
    case EnvironmentType.Development: {
      return 'Development';
    }
    case EnvironmentType.Test: {
      return 'Test';
    }
    case EnvironmentType.Staging: {
      return 'Staging';
    }
    case EnvironmentType.Production: {
      return 'Production';
    }
    default:
      return 'Production';
  }
}

// Helper function to figure out the next environment when toggling through environments
export function getNextEnvironmentType(env: EnvironmentType) {
  switch (env) {
    case EnvironmentType.Production: {
      return EnvironmentType.Local;
    }
    case EnvironmentType.Local: {
      return EnvironmentType.Development;
    }
    default:
      return EnvironmentType.Production;
  }
}

function getEnvironmentConfigurationFromConstants(env: EnvironmentType) {
  let config = Constants.expoConfig?.extra?.environments?.[env] as
    | EnvironmentConfiguration
    | PlatformEnvironmentConfiguration;

  if (config && Object.prototype.hasOwnProperty.call(config, 'ios')) {
    config = Platform.select(
      config as PlatformEnvironmentConfiguration,
    ) as EnvironmentConfiguration;
    return config;
  } else {
    return config as EnvironmentConfiguration;
  }
}

export enum EnvironmentManagerEvents {
  ConfigurationChanged = 'ConfigurationChanged',
}

class EnvironmentManager extends SimpleEventEmitter {
  static shared = new EnvironmentManager();

  private environment = EnvironmentType.Production;

  private configuration: EnvironmentConfiguration =
    Constants.expoConfig?.extra?.environments?.[EnvironmentType.Production];

  private useBundledContent = true;

  initialize = async () => {
    // Set env
    const env = (await AsyncStorage.getItem(
      EnvPersistanceKey,
    )) as EnvironmentType;
    if (env) {
      this.environment = env;
    } else {
      this.environment = __DEV__
        ? EnvironmentType.Local
        : EnvironmentType.Production;
    }

    // Load configuration
    const config = getEnvironmentConfigurationFromConstants(this.environment);

    if (config) {
      this.configuration = config;
    }

    this.emit(
      EnvironmentManagerEvents.ConfigurationChanged,
      this.environment,
      this.configuration,
    );

    return true;
  };

  toggleEnvironment = async () => {
    this.changeEnvironment(getNextEnvironmentType(this.environment));
  };

  changeEnvironment = async (env: EnvironmentType) => {
    // console.debug({new: env, current: this.environment})
    if (env !== this.environment) {
      const config = getEnvironmentConfigurationFromConstants(env);

      if (config) {
        this.environment = env;
        this.configuration = config as EnvironmentConfiguration;
        await AsyncStorage.setItem(EnvPersistanceKey, env);

        this.emit(
          EnvironmentManagerEvents.ConfigurationChanged,
          this.environment,
          this.configuration,
        );
      }
    }
  };

  getEnvironment = () => {
    return this.environment;
  };

  getConfiguration = () => {
    return this.configuration;
  };

  getUseBundledContent = () => {
    return this.useBundledContent || false;
  };

  isProduction = () => {
    return this.environment === EnvironmentType.Production;
  };

  apiUrl = () => {
    return this.configuration?.apiUrl || 'http://localhost:3000';
  };

  webUrl = () => {
    return this.configuration?.webUrl || 'http://localhost:3000';
  };

  socketUrl = () => {
    return this.configuration?.socketUrl || 'ws://localhost:3000/socket/app';
  };
}

export default EnvironmentManager;
