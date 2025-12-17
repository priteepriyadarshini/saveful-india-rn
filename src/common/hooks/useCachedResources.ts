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
        // Load fonts
        await Font.loadAsync({
          'Saveful-Bold': require('../../../assets/fonts/Saveful-Bold.otf'),
          'Saveful-BoldItalic': require('../../../assets/fonts/Saveful-BoldItalic.otf'),
          'Saveful-Italic': require('../../../assets/fonts/Saveful-Italic.otf'),
          'Saveful-Regular': require('../../../assets/fonts/Saveful-Regular.otf'),
          'Saveful-SemiBold': require('../../../assets/fonts/Saveful-SemiBold.otf'),
          'Saveful-SemiBoldItalic': require('../../../assets/fonts/Saveful-SemiBoldItalic.otf'),
        });

        await EnvironmentManager.shared.initialize();
        // await DeviceSettingsManager.shared.initialize();
        await TokenManager.shared.initialize();

        await store.dispatch(loadFeatureFlags());

        // // Load session data
        await store.dispatch(loadSessionData());
      } catch (e) {
        // We might want to provide this error information to an error reporting service
        console.warn(e);
      } finally {
        setLoadingComplete(true);
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  return isLoadingComplete;
}
