import { Feather } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { ViewStyle } from 'react-native';

export interface CustomButtonProps {
  style?: ViewStyle;
  buttonTextStyle?: ViewStyle;
  buttonSize?: 'small' | 'medium' | 'large';
  width?: 'auto' | 'full';
  loading?: boolean;
  children?: ReactNode;
  iconLeft?: keyof typeof Feather.glyphMap;
  iconRight?: keyof typeof Feather.glyphMap;
  disabled?: boolean;
  onPress?: () => void;
}
