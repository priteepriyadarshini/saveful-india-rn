export interface PushToken {
  id?: number;
  token: string;
  app_version?: string;
  app_build?: string;
  app_bundle: string;
  token_mode: 'prod' | 'dev';
  token_type: 'apns' | 'fcm';
}
