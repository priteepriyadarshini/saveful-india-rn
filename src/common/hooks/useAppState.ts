import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export default function useAppState(): AppStateStatus {
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState,
  );

  // App resume
  useEffect(() => {
    const listener = AppState.addEventListener('change', setAppState);

    return () => {
      listener.remove();
    };
  }, []);

  return appState;
}
