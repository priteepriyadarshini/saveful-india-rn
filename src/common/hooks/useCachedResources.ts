import * as Font from 'expo-font';
import { loadSessionData } from '../../modules/auth/sessionSlice';
import { loadFeatureFlags } from '../../modules/developer/featureFlags/slice';
import EnvironmentManager from '../../modules/environment/environmentManager';
import { TokenManager } from '../../modules/pushNotifications/TokenManager';
import { useEffect, useState } from 'react';
import { store } from '../../store/store';

export default function useCachedResources() {
  const [isLoadingComplete, setLoadingComplete] = useState(false);

  // Load any resources or data that we need prior to rendering the app
  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        // Load fonts with error handling
        try {
          await Font.loadAsync({
            'Saveful-Bold': require('../../../assets/fonts/Saveful-Bold.otf'),
            'Saveful-BoldItalic': require('../../../assets/fonts/Saveful-BoldItalic.otf'),
            'Saveful-Italic': require('../../../assets/fonts/Saveful-Italic.otf'),
            'Saveful-Regular': require('../../../assets/fonts/Saveful-Regular.otf'),
            'Saveful-SemiBold': require('../../../assets/fonts/Saveful-SemiBold.otf'),
            'Saveful-SemiBoldItalic': require('../../../assets/fonts/Saveful-SemiBoldItalic.otf'),
          });
        } catch (fontError) {
          console.error('Failed to load fonts:', fontError);
          // Continue even if fonts fail - app can still work with system fonts
        }

        // Initialize environment manager
        try {
          await EnvironmentManager.shared.initialize();
        } catch (envError) {
          console.error('Failed to initialize EnvironmentManager:', envError);
          // Continue - will use default environment
        }

        // Initialize token manager
        try {
          await TokenManager.shared.initialize();
        } catch (tokenError) {
          console.error('Failed to initialize TokenManager:', tokenError);
          // Continue - token manager is not critical for app startup
        }

        // Load feature flags
        try {
          await store.dispatch(loadFeatureFlags());
        } catch (flagsError) {
          console.error('Failed to load feature flags:', flagsError);
          // Continue - feature flags are not critical
        }

        // Load session data
        try {
          await store.dispatch(loadSessionData());
        } catch (sessionError) {
          console.error('Failed to load session data:', sessionError);
          // Continue - user will just need to login again
        }
      } catch (e) {
        // We might want to provide this error information to an error reporting service
        console.warn('Error during resource loading:', e);
      } finally {
        setLoadingComplete(true);
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  return isLoadingComplete;
}
