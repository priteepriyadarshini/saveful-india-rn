import React from 'react';
import { Image, Text, View } from 'react-native';
import { bundledSource } from '../../../common/helpers/uriHelpers';
import tw from '../../../common/tailwind';
import { ISponsor } from '../../../models/craft';
import { subheadSmallUppercase } from '../../../theme/typography';
import useEnvironment from '../../environment/hooks/useEnvironment';

interface IHackOrTipSponsor extends ISponsor {
  sponsorTitle: string | null;
}

export default function HackOrTipSponsor({
  sponsorTitle,
  sponsorLogoBlackAndWhite,
}: IHackOrTipSponsor) {
  const env = useEnvironment();

  return (
    <View style={tw.style('flex-row items-center justify-start gap-3')}>
      <Text style={tw.style('flex', subheadSmallUppercase)}>
        {sponsorTitle ?? 'Sponsored by'}
      </Text>
      {sponsorLogoBlackAndWhite?.[0] && (
        <Image
          style={tw.style('w-15 h-7.5')}
          resizeMode="contain"
          source={bundledSource(
            sponsorLogoBlackAndWhite[0].url,
            env.useBundledContent,
          )}
          accessibilityIgnoresInvertColors
        />
      )}
    </View>
  );
}
