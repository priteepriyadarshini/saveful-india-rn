import { Feather } from '@expo/vector-icons';
import tw from '../../../common/tailwind';
import React from 'react';
import { Animated, Pressable, View } from 'react-native';

export default function OnboardingHeader({
  progress,
  onPressBack,
}: {
  progress?: number;
  onPressBack: () => void;
}) {
  return (
    // The first view is just a container for the bg and the search
    <View
      style={tw` left-0 right-0 z-20 flex-row items-center justify-between gap-3 py-3`}
    >
      {!progress ? (
        <View style={tw`ml-5 h-5 w-5`} />
      ) : (
        <Pressable
          style={tw`ml-5 flex h-5 w-5 items-center justify-center`}
          onPress={onPressBack}
          accessibilityRole="button"
        >
          <Feather name="arrow-left" color="black" size={20} />
        </Pressable>
      )}

      {!!progress && (
        <View style={tw.style('relative h-1 w-[138px] rounded-full bg-mint')}>
          <Animated.View
            style={tw`absolute h-full rounded-full bg-kale w-[${
              progress * 138
            }px]`}
          />
        </View>
      )}

      <View style={tw`mr-5 h-5 w-5`} />
    </View>
  );
}
