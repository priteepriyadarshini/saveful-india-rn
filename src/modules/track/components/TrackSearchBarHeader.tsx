import TextBoxInput from '../../../common/components/Form/TextBoxInput';
import tw from '../../../common/tailwind';
import React, { useState } from 'react';
import { Animated, Pressable, View } from 'react-native';

export default function TrackSearchBarHeader({
  animatedValue,
  onPress,
}: {
  animatedValue: Animated.Value;
  onPress: () => void;
}) {
  const headerOpacity = animatedValue.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const [searchInput, setSearchInput] = useState<string>();

  return (
    <View>
      <Animated.View
        style={[
          tw`absolute left-0 right-0 z-10 bg-white shadow-md`,
          {
            opacity: headerOpacity,
          },
        ]}
      />
      <View style={tw`z-20 justify-start pb-2.5 pt-6`}>
        <Pressable
          accessibilityRole="button"
          style={tw`mx-5 grow`}
          onPress={onPress}
        >
          <TextBoxInput
            value={searchInput}
            placeholder="Search the dishes you've made"
            onChangeText={setSearchInput}
            iconRight="search"
          />
        </Pressable>
      </View>
    </View>
  );
}
