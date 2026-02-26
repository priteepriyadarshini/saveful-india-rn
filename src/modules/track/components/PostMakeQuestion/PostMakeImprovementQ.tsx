import SecondaryButton from '../../../../common/components/ThemeButtons/SecondaryButton';
import tw from '../../../../common/tailwind';
import { IMPROVEMENT_REASONS } from '../../data/data';
import React, { useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { h6TextStyle, bodyMediumRegular } from '../../../../theme/typography';

interface Props {
  dishName: string;
  onSelect: (reasonKey: string) => void;
}

export default function PostMakeImprovementQ({ dishName, onSelect }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <View style={tw`h-full w-full items-center justify-between px-5`}>
      <ScrollView contentContainerStyle={tw`pb-10`}>
        <Animatable.View animation="fadeIn" duration={400} useNativeDriver>
          <Image
            style={tw`mx-auto mb-6 h-[180px] w-[220px]`}
            resizeMode="contain"
            source={require('../../../../../assets/placeholder/question-mark.png')}
            accessibilityIgnoresInvertColors
          />

          <Text
            style={tw.style(h6TextStyle, 'pb-2 text-center text-white')}
            maxFontSizeMultiplier={1}
          >
            What could be improved?
          </Text>

          <Text
            style={tw.style(bodyMediumRegular, 'pb-6 text-center text-white')}
          >
            {`Help us make ${dishName} even better next time.`}
          </Text>

          <View style={tw`pt-2`}>
            {IMPROVEMENT_REASONS.map((reason) => (
              <SecondaryButton
                key={reason.id}
                style={tw.style(
                  'mb-2',
                  selected === reason.key ? 'bg-black' : '',
                )}
                buttonTextStyle={tw.style(
                  selected === reason.key ? 'text-white' : '',
                )}
                onPress={() => {
                  setSelected(reason.key);
                  setTimeout(() => onSelect(reason.key), 600);
                }}
              >
                {reason.label}
              </SecondaryButton>
            ))}
          </View>
        </Animatable.View>
      </ScrollView>
    </View>
  );
}
