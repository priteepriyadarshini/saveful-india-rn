import * as Font from 'expo-font';
import { loadSessionData } from '../../modules/auth/sessionSlice';
import { loadFeatureFlags } from '../../modules/developer/featureFlags/slice';
import EnvironmentManager from '../../modules/environment/environmentManager';
import { TokenManager } from '../../modules/pushNotifications/TokenManager';
import { useEffect, useState } from 'react';
import { store } from '../../store/store';

export default function useCachedResources() {
  const [isLoadingComplete, setLoadingComplete] = useState(false);

  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
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
        }
        try {
          await EnvironmentManager.shared.initialize();
        } catch (envError) {
          console.error('Failed to initialize EnvironmentManager:', envError);

        }

        try {
          await TokenManager.shared.initialize();
        } catch (tokenError) {
          console.error('Failed to initialize TokenManager:', tokenError);
        }

        try {
          await store.dispatch(loadFeatureFlags());
        } catch (flagsError) {
          console.error('Failed to load feature flags:', flagsError);
   
        }

        try {
          await store.dispatch(loadSessionData());
        } catch (sessionError) {
          console.error('Failed to load session data:', sessionError);
        }
      } catch (e) {
        console.warn('Error during resource loading:', e);
      } finally {
        setLoadingComplete(true);
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  return isLoadingComplete;
}
