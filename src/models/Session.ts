export interface Session {
  access_token?: string;
  refresh_token?: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  email_verified: boolean;
  first_name: string;
  last_name: string;
  phone_number: string;
  photo_file: PhotoFile;
  push_notification_enabled: boolean;
  scope: string;
  invitation_code?: string;
  onesignal_id_hash?: string;
  onesignal_email_hash?: string;
  app_joined_at?: string;
  inserted_at?: string;
  timezone?: string;
}

export interface CurrentUserTOTP {
  totp_uri?: string;
  totp_enabled?: boolean;
  totp_recovery_codes?: string[];
}

export interface PhotoFile {
  blur_url: string | null;
  file: string | null; // Check this typo
  id: string;
  large_url: string | null;
  medium_url: string | null;
  name: string;
  original_url: string | null;
  small_url: string | null;
  thumb_url: string | null;
  upload_url: string;
}
export interface CurrentUserOnboarding {
  onboarding_completed: boolean;
  onboarding_permissions: boolean;
}

export type OpenBankingConnectionStatus =
  | 'not_connected'
  | 'consented'
  | 'expired'
  | 'expiring'
  | 'initiated'
  | 'connected'
  | 'error';

// Returns a boolean representing if a user has connected a bank account
export function isConnectedFromStatus(
  status?: OpenBankingConnectionStatus,
  opts?: { includeInitiatingAsConnected?: boolean },
) {
  if (!status) return undefined;

  switch (status) {
    case 'not_connected':
    case 'consented':
    case 'expired':
      return false;
    case 'initiated':
      // We usually lwant to include intiated as connected
      // but the MyImpact home screen is designed around us not doing that
      // so we can force it to false for that scenario here.
      return opts?.includeInitiatingAsConnected ?? true;
    case 'connected':
    case 'expiring':
    case 'error':
      return true;
    default:
      return false;
  }
}

export interface CurrentUserOpenBanking {
  open_banking_connection_status?: OpenBankingConnectionStatus;
}
