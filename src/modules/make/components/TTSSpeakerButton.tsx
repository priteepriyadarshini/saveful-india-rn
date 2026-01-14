import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from '../../../common/tailwind';

interface TTSSpeakerButtonProps {
  isEnabled: boolean;
  isSpeaking: boolean;
  onToggle: () => void;
}


export default function TTSSpeakerButton({
  isEnabled,
  isSpeaking,
  onToggle,
}: TTSSpeakerButtonProps) {
  return (
    <Pressable
      onPress={onToggle}
      style={tw.style(
        'absolute top-4 right-4 z-50 rounded-full p-3',
        isEnabled ? 'bg-lemon' : 'bg-white/30'
      )}
      accessibilityLabel={isEnabled ? 'Disable text-to-speech' : 'Enable text-to-speech'}
      accessibilityRole="button"
    >
      <View style={tw`relative`}>
        <Ionicons
          name={isSpeaking ? 'volume-high' : isEnabled ? 'volume-medium' : 'volume-mute'}
          size={24}
          color={isEnabled ? '#2E5F4F' : '#FFFFFF'}
        />
        {isSpeaking && (
          <View
            style={tw`absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500`}
          />
        )}
      </View>
    </Pressable>
  );
}
