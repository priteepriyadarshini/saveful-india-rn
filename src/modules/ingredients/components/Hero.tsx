import { bundledSource } from '../../../common/helpers/uriHelpers';
import tw from '../../../common/tailwind';
import { IAsset, ISticker } from '../../../models/craft';
import useEnvironment from '../../../modules/environment/hooks/useEnvironment';
import { heroTheme } from '../../../modules/feed/utils/ingredientTheme';
import React from 'react';
import {
  Dimensions,
  Image,
  ImageRequireSource,
  Text,
  View,
} from 'react-native';
import { h2TextStyle } from '../../../theme/typography';

export default function Hero({
  heroImage,
  ingredientTheme,
  title,
  sticker,
}: {
  heroImage: IAsset[];
  ingredientTheme: string | null;
  title: string;
  sticker?: ISticker[];
}) {
  const env = useEnvironment();

  const heroImageBGSrc: ImageRequireSource = heroTheme(ingredientTheme);

  return (
    <View style={tw`relative w-full items-center p-5`}>
      <Text
        style={tw.style(h2TextStyle, 'text-center')}
        maxFontSizeMultiplier={1}
      >
        {title}
      </Text>
      <View style={tw`relative justify-start py-5`}>
        <Image
          style={tw`mx-auto h-[${
            ((Dimensions.get('screen').width - 40) * 345) / 345
          }px] w-[${Dimensions.get('screen').width - 40}px]`}
          resizeMode="contain"
          source={heroImageBGSrc}
          accessibilityIgnoresInvertColors
        />
        <Image
          style={tw`absolute bottom-4 left-1/2 mx-auto -ml-[159px] h-[318px] w-[318px]`}
          resizeMode="contain"
          source={
            heroImage[0]?.url
              ? bundledSource(heroImage[0].url, env.useBundledContent)
              : require('../../../../assets/ingredients/placeholder.png') // TODO: Add default image
          }
          accessibilityIgnoresInvertColors
        />
      </View>

      {/* Sticker */}
      {sticker &&
        sticker.length > 0 &&
        sticker[0].image &&
        !!sticker[0].image[0].url && (
          <Image
            style={[tw`absolute bottom-5 right-5 h-[115px] w-[106px]`]}
            resizeMode="contain"
            source={bundledSource(
              sticker[0].image[0].url,
              env.useBundledContent,
            )}
            accessibilityIgnoresInvertColors
          />
        )}
    </View>
  );
}
