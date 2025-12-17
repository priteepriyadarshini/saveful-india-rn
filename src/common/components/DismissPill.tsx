import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text } from 'react-native';
import { bodySmallRegular } from '../../theme/typography';
import tw from '../tailwind';

function DismissPill({
  text = 'dismiss',
  setIsDismissed,
  showCloseIcon = true,
}: {
  text?: string;
  setIsDismissed?: (value: boolean) => void;
  showCloseIcon?: boolean;
}): React.ReactElement | null {
  return (
    <Pressable
      style={tw.style(
        'flex-row items-center gap-1 rounded-full bg-strokecream px-[9px] py-0.5',
      )}
      onPress={() => {
        setIsDismissed && setIsDismissed(true);
      }}
    >
      <Text style={tw.style(bodySmallRegular, 'text-midgray')}>{text}</Text>
      {showCloseIcon && (
        <Feather name="x" size={16} style={tw.style('text-midgray')} />
      )}
    </Pressable>
  );
}

export default DismissPill;
