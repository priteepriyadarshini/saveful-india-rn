import PrimaryButton from '../../../../common/components/ThemeButtons/PrimaryButton';
import tw from '../../../../common/tailwind';
import React from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { h6TextStyle, bodyMediumRegular } from '../../../../theme/typography';

interface Props {
  portionSize: string; 
  dishName: string;
  onDone: () => void;
  isLoading?: boolean;
}

export default function PostMakeNoLeftoverDone({
  portionSize,
  dishName,
  onDone,
  isLoading,
}: Props) {
  const isNotEnough = portionSize === 'not_enough';

  return (
    <View style={tw`h-full w-full justify-between`}>
      <ScrollView contentContainerStyle={tw`px-5 pb-10`}>
        <Animatable.View animation="fadeIn" duration={400} useNativeDriver>
          <Image
            style={tw`mx-auto mb-6 h-[220px] w-[200px]`}
            resizeMode="contain"
            source={
              isNotEnough
                ? { uri: 'https://d3fg04h02j12vm.cloudfront.net/placeholder/bowl.png' }
                : { uri: 'https://d3fg04h02j12vm.cloudfront.net/placeholder/post-fridge.png' }
            }
            accessibilityIgnoresInvertColors
          />

          <Text
            style={tw.style(h6TextStyle, 'pb-2 text-center text-white')}
            maxFontSizeMultiplier={1}
          >
            {isNotEnough
              ? 'Good to know!'
              : 'Zero waste champion!'}
          </Text>

          <Text
            style={tw.style(bodyMediumRegular, 'px-2 text-center text-white')}
          >
            {isNotEnough
              ? `Thanks for the feedback! Next time you make ${dishName}, try increasing the portions slightly. Every cook gets better with practice.`
              : `Amazing job! You cooked just the right amount of ${dishName} and nothing went to waste. That's a win for your wallet and the planet!`}
          </Text>
        </Animatable.View>
      </ScrollView>

      <View style={tw`px-5`}>
        <PrimaryButton
          style={tw.style('mb-2 mt-4')}
          buttonSize="large"
          onPress={onDone}
          loading={isLoading}
          disabled={isLoading}
        >
          Done
        </PrimaryButton>
      </View>
    </View>
  );
}
