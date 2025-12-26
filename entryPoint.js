import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import 'react-native-url-polyfill/auto';

// Polyfill for Reanimated environment issue in Expo Go
if (global.window && !global.window.addEventListener) {
  global.window.addEventListener = () => {};
  global.window.removeEventListener = () => {};
}

import MyRootComponent from './src/App';

registerRootComponent(MyRootComponent);