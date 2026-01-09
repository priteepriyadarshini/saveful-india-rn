import React from 'react';
import { StyleProp, Text, ViewStyle } from 'react-native';
import tw from '../../tailwind';
import DebouncedPressable from '../DebouncePressable';
import { bodySmallBold } from '../../../theme/typography';

interface OutlineButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  buttonSize?: 'small' | 'medium' | 'large';
}

export default function OutlineButton({
  children,
  onPress,
  style,
  disabled = false,
  buttonSize = 'medium',
}: OutlineButtonProps) {
  const sizeStyles = {
    small: 'px-3 py-2',
    medium: 'px-4 py-3',
    large: 'px-6 py-4',
  };

  const buttonStyle = tw.style(
    'items-center justify-center rounded-lg border-2 border-eggplant',
    sizeStyles[buttonSize],
    disabled && 'opacity-50',
  );

  return (
    <DebouncedPressable
      onPress={onPress}
      disabled={disabled}
      style={[buttonStyle, style]}
    >
      {typeof children === 'string' ? (
        <Text
          style={tw.style(bodySmallBold, 'text-center text-eggplant')}
          maxFontSizeMultiplier={1}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </DebouncedPressable>
  );
}
