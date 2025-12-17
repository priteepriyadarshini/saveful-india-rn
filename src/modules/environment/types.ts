export const EnvPersistanceKey = 'current-env';

export enum EnvironmentType {
  Local = 'local',
  Development = 'dev',
  Test = 'test',
  Staging = 'staging',
  Production = 'prod',
}

export interface EnvironmentConfiguration {
  title: string;
  apiUrl: string;
  webUrl: string;
  socketUrl: string;
  supportEmail: string;
  mixpanelToken?: string;
}

export interface PlatformEnvironmentConfiguration {
  ios: EnvironmentConfiguration;
  android: EnvironmentConfiguration;
}
