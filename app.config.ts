import { ConfigContext, ExpoConfig } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,

  name: 'Saveful',
  slug: 'saveful-app',
  scheme: 'saveful',
  version: '1.2.21',
  orientation: 'portrait',
  jsEngine: 'hermes',

  icon: './assets/icon.png',

  updates: {
    enabled: false,
    fallbackToCacheTimeout: 0,
  },

  experiments: {
    tsconfigPaths: true,
  },

  assetBundlePatterns: ['**/*'],
  userInterfaceStyle: 'automatic',

  android: {
    package: 'com.saveful.app',
    permissions: ['ACCESS_NETWORK_STATE'],
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#FFFAF3',
    },
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#FFFAF3',
    },
    intentFilters: [
      {
        autoVerify: true,
        action: 'VIEW',
        data: [
          { scheme: 'https', host: 'app.dev.saveful.com', pathPattern: '/make' },
          { scheme: 'https', host: 'app.dev.saveful.com', pathPattern: '/make/prep/*' },
          { scheme: 'https', host: 'app.dev.saveful.com', pathPattern: '/feed' },
          { scheme: 'https', host: 'app.dev.saveful.com', pathPattern: '/hacks/*' },

          { scheme: 'https', host: 'app.staging.saveful.com', pathPattern: '/make' },
          { scheme: 'https', host: 'app.staging.saveful.com', pathPattern: '/make/prep/*' },
          { scheme: 'https', host: 'app.staging.saveful.com', pathPattern: '/feed' },
          { scheme: 'https', host: 'app.staging.saveful.com', pathPattern: '/hacks/*' },

          { scheme: 'https', host: 'app.saveful.com', pathPattern: '/make' },
          { scheme: 'https', host: 'app.saveful.com', pathPattern: '/make/prep/*' },
          { scheme: 'https', host: 'app.saveful.com', pathPattern: '/feed' },
          { scheme: 'https', host: 'app.saveful.com', pathPattern: '/hacks/*' },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },

  ios: {
    bundleIdentifier: 'com.saveful.app',
    buildNumber: '1',
    supportsTablet: false,
    icon: './assets/icon.png',
    infoPlist: {
      CADisableMinimumFrameDurationOnPhone: true,
      NSPhotoLibraryUsageDescription: 'The app accesses your photos to let you add a profile image.',
      NSCameraUsageDescription: 'The app accesses your camera to let you add a profile image.',
      NSMicrophoneUsageDescription: 'We do not access your microphone',
      ITSAppUsesNonExemptEncryption: false,
      LSApplicationQueriesSchemes: ['otpauth'],
      OneSignal_disable_badge_clearing: true,
      LSMinimumSystemVersion: '12',
    },
    associatedDomains: [
      'webcredentials:app.dev.saveful.com',
      'webcredentials:app.staging.saveful.com',
      'webcredentials:app.saveful.com',
      'applinks:app.dev.saveful.com',
      'applinks:app.staging.saveful.com',
      'applinks:app.saveful.com',
    ],
    splash: {
      image: './assets/splash.png',
      resizeMode: 'cover',
      backgroundColor: '#FFFAF3',
    },
    privacyManifests: {
      NSPrivacyAccessedAPITypes: [
        {
          NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryDiskSpace',
          NSPrivacyAccessedAPITypeReasons: ['7D9E.1', 'E174.1'],
        },
        {
          NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryFileTimestamp',
          NSPrivacyAccessedAPITypeReasons: ['C617.1'],
        },
        {
          NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryUserDefaults',
          NSPrivacyAccessedAPITypeReasons: ['1C8F.1'],
        },
        {
          NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategorySystemBootTime',
          NSPrivacyAccessedAPITypeReasons: ['3D61.1'],
        },
      ],
    },
  },

  notification: {
    icon: './assets/notification_icon.png',
    color: '#4B2176',
  },

  extra: {
    eas: {
      projectId: '834347b1-3a49-45f6-8aca-16929fc1895a',
    },

    dev: {
      accessToken: process.env.ACCESS_TOKEN,
      refreshToken: process.env.REFRESH_TOKEN,
    },

    environments: {
      prod: {
        title: 'Production',
        apiUrl: 'https://api.saveful.com',
        webUrl: 'https://app.saveful.com',
        socketUrl: 'wss://api.saveful.com/socket/app',
        mixpanelToken: process.env.MIX_PANEL_TOKEN_PROD ?? 'a2c3d861686b754ad1763514f8c4e704',
      },
      dev: {
        title: 'Development',
        apiUrl: 'https://api.dev.saveful.com',
        webUrl: 'https://app.dev.saveful.com',
        socketUrl: 'wss://api.dev.saveful.com/socket/app',
        mixpanelToken: process.env.MIX_PANEL_TOKEN_DEV ?? 'c6e4e232a5e8aa13cd37e2a94bc06ac3',
      },
      test: {
        title: 'Test',
        apiUrl: 'https://api.test.saveful.com',
        webUrl: 'https://app.test.saveful.com',
        socketUrl: 'wss://api.test.saveful.com/socket/app',
      },
      staging: {
        title: 'Staging',
        apiUrl: 'https://api.staging.saveful.com',
        webUrl: 'https://app.staging.saveful.com',
        socketUrl: 'wss://api.staging.saveful.com/socket/app',
        mixpanelToken: 'b76d46a3c0b5befe426c65230ce3a1c9',
      },
      local: {
        android: {
          title: 'Local (Android)',
          apiUrl: process.env.LOCAL_URL ?? 'https://backend.saveful.devsomeware.com',
          webUrl: process.env.WEB_URL ?? 'https://backend.saveful.devsomeware.com',
          socketUrl: process.env.SOCKET_URL ?? 'ws://192.168.0.192:3000/socket/app',
        },
        ios: {
          title: 'Local (iOS)',
          apiUrl: process.env.LOCAL_URL ?? 'https://backend.saveful.devsomeware.com',
          webUrl: process.env.WEB_URL ?? 'https://backend.saveful.devsomeware.com',
          socketUrl: process.env.SOCKET_URL ?? 'ws://192.168.0.192:3000/socket/app',
        },
      },
    },

    oneSignalAppId: '905089d3-5a54-46dd-8e22-669fc07adce3',
  },

  plugins: [
    'expo-localization',
    'expo-font',
    'expo-secure-store',
    '@react-native-community/datetimepicker',
    'expo-web-browser',
    [
      'onesignal-expo-plugin',
      {
        mode: 'development',
      },
    ],
   [
  'expo-build-properties',
  {
    android: {
      compileSdkVersion: 35,
      targetSdkVersion: 35,
      buildToolsVersion: '35.0.0',
    },
    ios: {
      deploymentTarget: '15.1',
    },
  },
],
  ],
});
