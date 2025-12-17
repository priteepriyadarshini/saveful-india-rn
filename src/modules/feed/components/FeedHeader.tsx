import tw from '../../../common/tailwind';
import React from 'react';
import { View } from 'react-native';

export default function FeedHeader() {
  return (
    <View style={tw`flex-1 bg-creme`}>
      {/* <Image
        style={[
          tw`w-[${Dimensions.get('screen').width}px] h-[${
            (Dimensions.get('screen').width * 241) / 375
          }px]`,
          // { tintColor: focused ? undefined : tw.color('gray-200') },
        ]}
        resizeMode="contain"
        source={require('../../../../assets/placeholder/feed-bg.png')}
        accessibilityIgnoresInvertColors
      /> */}
    </View>
  );
}

