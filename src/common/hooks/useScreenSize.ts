import tw from '../tailwind';
import { useWindowDimensions } from 'react-native';
import { Style } from 'twrnc'; 

export enum ScreenSizeType {
  S = 0,
  M,
  L,
  XL,
}

export default function useScreenSize() {
  const { height } = useWindowDimensions();
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


  const getStyle = (baseStyle: string, styles: string[]): Style => {
    const screenSize = calculateScreenSize();
    return tw.style(baseStyle, styles[screenSize]);
  };

  return { calculateScreenSize, getStyle };
}
