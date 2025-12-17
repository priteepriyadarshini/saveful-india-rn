import tw from '../tailwind';
import { useWindowDimensions } from 'react-native';
import { Style } from 'twrnc'; //maybe error during bundling

export enum ScreenSizeType {
  S = 0,
  M,
  L,
  XL,
}

export default function useScreenSize() {
  const { height } = useWindowDimensions();
  // Little helper function to get current device height
  const calculateScreenSize = (): ScreenSizeType => {
    if (height < 550) {
      return ScreenSizeType.S;
    }
    if (height < 760) {
      return ScreenSizeType.M;
    }
    if (height < 840) {
      return ScreenSizeType.L;
    }
    return ScreenSizeType.XL;
  };

  // Little helper function that will return a style with different styles depending on device size.
  const getStyle = (baseStyle: string, styles: string[]): Style => {
    const screenSize = calculateScreenSize();
    return tw.style(baseStyle, styles[screenSize]);
  };

  return { calculateScreenSize, getStyle };
}
