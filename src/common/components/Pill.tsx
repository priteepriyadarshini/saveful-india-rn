import { Feather } from '@expo/vector-icons';
import tw from '../tailwind';
import React from 'react';
import { Pressable, Text } from 'react-native';
import { bodySmallRegular, subheadMediumUppercase } from '../../theme/typography';

function Pill({
  text,
  size = 'small',
  isActive = false,
  setIsActive,
  showCloseIcon = false,
  kind = 'normal',
}: {
  text: string;
  size?: 'small' | 'large';
  isActive?: boolean;
  setIsActive?: (value: boolean) => void;
  showCloseIcon?: boolean;
  kind?: string;
}): React.ReactElement | null {
  return (
    <Pressable
      style={tw.style('flex-row items-center gap-0.5 rounded-full border', {
        'px-2 py-0.5': size === 'small',
        'px-2.5 py-1': size === 'large',
        'border-stone': kind === 'normal',
        'border-eggplant bg-white': kind === 'vibrant',
        'bg-eggplant': isActive && kind === 'normal',
        'bg-eggplant-vibrant': isActive && kind === 'vibrant',
      })}
      onPress={() => {
        setIsActive && setIsActive(!isActive);
      }}
    >
      <Text
        style={tw.style(
          size === 'large' ? bodySmallRegular : subheadMediumUppercase,
          {
            'text-stone': kind === 'normal',
            'text-eggplant-vibrant': kind === 'vibrant',
            'text-white': isActive,
          },
        )}
      >
        {text}
      </Text>
      {showCloseIcon && isActive && (
        <Feather name="x" size={12} color={tw.color('white')} />
      )}
    </Pressable>
  );
}

export default Pill;
