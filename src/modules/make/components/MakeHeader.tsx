import tw from '../../../common/tailwind';
import React from 'react';
import { Text, View } from 'react-native';
import { h6TextStyle, bodySmallRegular } from '../../../theme/typography';

export default function MakeHeader() {
  return (
    <View style={tw`flex-1`}>
      <View style={tw`mt-3.5`}>
        <Text style={tw.style(h6TextStyle, 'text-center')}>
          Browse all meals
        </Text>
        <Text
          style={tw.style(
            bodySmallRegular,
            'mx-10 mt-1.5 text-center text-midgray',
          )}
        >
          Our meals, your ingredients – any which way. Here are some
          super-flexible dishes to try:
        </Text>
      </View>
    </View>
  );
}
