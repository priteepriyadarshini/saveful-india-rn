import SecondaryButton from '../../../../common/components/ThemeButtons/SecondaryButton';
import tw from '../../../../common/tailwind';
import React from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { h6TextStyle, bodyMediumRegular } from '../../../../theme/typography';

interface Props {
  onAnswer: (hasLeftovers: boolean) => void;
  isLoading?: boolean;
}

export default function PostMakeLeftoverAskQ({ onAnswer, isLoading }: Props) {
  return (
    <View style={tw`h-full w-full items-center justify-between px-5`}>
      <ScrollView contentContainerStyle={tw`pb-10`}>
        <Animatable.View animation="fadeIn" duration={400} useNativeDriver>
          <Image
            style={tw`mx-auto mb-7 h-[280px] w-[260px] max-w-full`}
            resizeMode="contain"
            source={require('../../../../../assets/placeholder/tuppleware.png')}
            accessibilityIgnoresInvertColors
          />

          <Text
            style={tw.style(h6TextStyle, 'pb-2 text-center text-white')}
            maxFontSizeMultiplier={1}
          >
            Do you have any leftovers?
          </Text>

          <Text
            style={tw.style(bodyMediumRegular, 'pb-6 text-center text-white')}
          >
            {`We'll help you store them properly and suggest tasty ways to use them up!`}
          </Text>

          <View style={tw`pt-4`}>
            <SecondaryButton
              style={tw.style('mb-2')}
              onPress={() => onAnswer(true)}
              loading={isLoading}
            >
              Yes, I do
            </SecondaryButton>
            <SecondaryButton
              style={tw.style('mb-2')}
              onPress={() => onAnswer(false)}
              loading={isLoading}
            >
              Nope, all eaten!
            </SecondaryButton>
          </View>
        </Animatable.View>
      </ScrollView>
    </View>
  );
}
