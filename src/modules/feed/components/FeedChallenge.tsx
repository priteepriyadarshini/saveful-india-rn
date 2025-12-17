import { Feather } from '@expo/vector-icons';
import { bundledSource } from '../../../common/helpers/uriHelpers';
import tw from '../../../common/tailwind';
import { IChallenge } from '../../../models/craft';
import useEnvironment from '../../../modules/environment/hooks/useEnvironment';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { bodyLargeBold, subheadMediumUppercase } from '../../../theme/typography';

export default function FeedChallenge({
  isVisible,
  toggleChallengeModal,
  challenge,
}: {
  isVisible: boolean;
  toggleChallengeModal: (dismiss?: boolean) => void;
  challenge: IChallenge;
}) {
  const env = useEnvironment();

  if (!isVisible) return null;

  return (
    <View style={tw`mt-6 w-full px-4`}>
      <View style={tw.style('items-end pb-2')}>
        <Pressable
          onPress={() => {
            toggleChallengeModal(true);
          }}
        >
          <Feather name="x" size={24} color={tw.color('white')} />
        </Pressable>
      </View>
      <View style={tw.style('shrink items-center justify-center')}>
        <Image
          resizeMode="contain"
          style={tw`mr-2.5 h-[132px] w-[183px]`}
          source={bundledSource(
            challenge.challengeBadge[0].url,
            env.useBundledContent,
          )}
          accessibilityIgnoresInvertColors
        />
        <Text
          style={tw.style(
            bodyLargeBold,
            'mt-1 text-center uppercase text-white',
          )}
        >
          {challenge.optInBannerMessage}
        </Text>
        <Pressable
          onPress={() => toggleChallengeModal(false)}
          style={tw.style('mt-3 rounded-[11px] bg-eggplant-vibrant px-4 py-1')}
        >
          <Text
            style={tw.style(subheadMediumUppercase, 'uppercase text-white')}
          >
            find out more
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
