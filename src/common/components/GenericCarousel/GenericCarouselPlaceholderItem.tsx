import React from 'react';
import { Image, StyleProp, Text, View, ViewStyle } from 'react-native';
import { ClassInput } from 'twrnc'; //may cause some error while bundling
import tw from '../../tailwind';


interface Props {
  tailwindStyle?: ClassInput;
  containerStyle?: ViewStyle;
  style?: StyleProp<ViewStyle>;
}
export default function GenericCarouselItem({
  tailwindStyle,
  containerStyle,
  style,
}: Props) {
  return (
    <View style={tw.style('mr-4 w-40', containerStyle)}>
      <View
        style={[
          tw.style(
            'border-black/05 h-[180px] w-40 overflow-hidden rounded-xl border bg-white',
            tailwindStyle,
          ),
          style,
        ]}
      >
        <Image
          style={tw`flex-1`}
          source={{ uri: undefined }}
          accessibilityIgnoresInvertColors
        />
      </View>
      <View style={tw`mt-2 flex-row items-center`}>
        <Text
          style={tw`flex-1 bg-gray-200 font-sans-bold text-base`}
          numberOfLines={1}
          minimumFontScale={1}
          maxFontSizeMultiplier={1}
        >
          {' '}
        </Text>
      </View>
      <Text
        style={tw`mt-[2px] bg-gray-200 font-sans text-sm font-normal text-gray-600`}
        numberOfLines={2}
        minimumFontScale={1}
        maxFontSizeMultiplier={1}
      >
        {' '}
      </Text>
    </View>
  );
}
