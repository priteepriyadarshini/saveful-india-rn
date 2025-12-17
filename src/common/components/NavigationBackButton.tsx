import { Feather } from '@expo/vector-icons';
import tw from '../tailwind';
import React from 'react';
import { Pressable } from 'react-native';

export default function NavigationBackButton({
  navigation,
}: {
  navigation: any;
}) {
  return (
    <Pressable
      style={tw`flex h-11 w-11 items-start justify-center`}
      onPress={() => navigation.goBack()}
      accessibilityRole="button"
    >
      <Feather name="arrow-left" color="black" size={20} />
    </Pressable>
  );
}
