import SecondaryButton from '../../../../common/components/ThemeButtons/SecondaryButton';
import tw from '../../../../common/tailwind';
import { PORTION_OPTIONS } from '../../data/data';
import React, { useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { h6TextStyle, bodyMediumRegular } from '../../../../theme/typography';

interface Props {
  dishName: string;
  onSelect: (portionKey: string) => void;
}

export default function PostMakePortionQ({ dishName, onSelect }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <View style={tw`h-full w-full items-center justify-between px-5`}>
      <ScrollView contentContainerStyle={tw`pb-10`}>
        <Animatable.View animation="fadeIn" duration={400} useNativeDriver>
          <Image
            style={tw`mx-auto mb-6 h-[200px] w-[200px]`}
            resizeMode="contain"
            source={{ uri: 'https://d3fg04h02j12vm.cloudfront.net/placeholder/bowl.png' }}
            accessibilityIgnoresInvertColors
          />

          <Text
            style={tw.style(h6TextStyle, 'pb-2 text-center text-white')}
            maxFontSizeMultiplier={1}
          >
            How was the portion size?
          </Text>

          <Text
            style={tw.style(bodyMediumRegular, 'pb-6 text-center text-white')}
          >
            {`This helps us fine-tune ${dishName} for next time.`}
          </Text>

          <View style={tw`pt-2`}>
            {PORTION_OPTIONS.map((option) => (
              <SecondaryButton
                key={option.id}
                style={tw.style(
                  'mb-2',
                  selected === option.key ? 'bg-black' : '',
                )}
                buttonTextStyle={tw.style(
                  selected === option.key ? 'text-white' : '',
                )}
                onPress={() => {
                  setSelected(option.key);
                  setTimeout(() => onSelect(option.key), 600);
                }}
              >
                {option.label}
              </SecondaryButton>
            ))}
          </View>
        </Animatable.View>
      </ScrollView>
    </View>
  );
}
