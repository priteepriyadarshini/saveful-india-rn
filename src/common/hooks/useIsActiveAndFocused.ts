import { useIsFocused } from '@react-navigation/native';

import useAppState from './useAppState';

function useIsActiveAndFocused() {
  const isFocused = useIsFocused();
  const appState = useAppState();

  return isFocused && appState === 'active';
}

export default useIsActiveAndFocused;
