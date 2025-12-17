// This file lets yous swap push notification token manager implementations
// import ExpoTokenManager from 'modules/pushNotifications/ExpoTokenManager';
// import OneSignalTokenManager from 'modules/pushNotifications/OneSignalTokenManager';
import ExpoTokenManager from '../../modules/pushNotifications/ExpoTokenManager';
import {
  TokenManagerEvents,
  TokenManagerPermissionStatus,
} from '../../modules/pushNotifications/TokenManagerBase';

// Use the one signal manager
// class TokenManager extends OneSignalTokenManager {}

// Use the expo token manager
class TokenManager extends ExpoTokenManager {}

export { TokenManager, TokenManagerEvents, TokenManagerPermissionStatus };
