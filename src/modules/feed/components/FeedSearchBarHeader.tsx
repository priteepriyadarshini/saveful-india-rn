import React from 'react';
import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import tw from '../../../common/tailwind';
import { bodyMediumRegular, h7TextStyle } from '../../../theme/typography';

interface Props {
  title: string;
  onPress?: () => void; // Made optional
}

const FeedSearchBarHeader: React.FC<Props> = ({ title, onPress }) => {
  return (
    <View style={tw``}>
      <View style={tw``}>
        <Text
          style={tw.style(h7TextStyle, 'mb-3 text-center text-white')}
          maxFontSizeMultiplier={1}
        >
          {title}
        </Text>
        <Pressable
          accessibilityRole="button"
          style={tw`mx-5 flex-row items-center justify-between rounded border border-strokecream bg-white px-4 py-3`}
          onPress={onPress}
        >
          <Text
            minimumFontScale={1}
            maxFontSizeMultiplier={2}
            style={tw.style(bodyMediumRegular, 'text-midgray')}
          >
            Search ingredients
          </Text>
          <Feather name="search" size={20} color="black" />
        </Pressable>
      </View>
    </View>
  );
}

export default FeedSearchBarHeader;
