import { bundledSource } from '../../../common/helpers/uriHelpers';
import tw from '../../../common/tailwind';
import { IAsset, ISticker } from '../../../models/craft';
import useEnvironment from '../../../modules/environment/hooks/useEnvironment';
import { Dimensions, Image, Text, View } from 'react-native';
import { bodyLargeBold, bodySmallRegular } from '../../../theme/typography';

export default function PrepInfoSticker({
  portions,
  prepAndCookTime,
  sticker,
  heroImage,
}: {
  portions: string | null;
  prepAndCookTime: number | null;
  sticker: ISticker[];
  heroImage: IAsset[];
}) {
  const env = useEnvironment();

  return (
    <View style={tw.style('relative flex-1 items-center')}>
      <View
        style={tw.style('z-10 w-full flex-1 flex-row justify-between px-4')}
      >
        {portions && (
          <View style={tw.style('flex-col justify-center')}>
            <Text style={tw.style(bodyLargeBold)}>{portions}</Text>
            <Text style={tw.style(bodySmallRegular, 'text-midgray')}>
              Portions
            </Text>
          </View>
        )}

        {prepAndCookTime && (
          <View style={tw.style('flex-col justify-center')}>
            <Text
              style={tw.style(bodyLargeBold)}
            >{`~${prepAndCookTime}min`}</Text>
            <Text style={tw.style(bodySmallRegular, 'text-midgray')}>
              Prep + Cook
            </Text>
          </View>
        )}

        {sticker &&
        sticker.length > 0 &&
        sticker[0].image &&
        !!sticker[0].image[0].url ? (
          <Image
            style={tw`h-[90px] w-[90px]`}
            resizeMode="contain"
            source={bundledSource(
              sticker[0].image[0].url,
              env.useBundledContent,
            )}
            accessibilityIgnoresInvertColors
          />
        ) : (
          <View style={tw`h-[90px] w-[90px]`} />
        )}
      </View>

      {heroImage && heroImage.length > 0 && heroImage[0].url && (
        <View>
          <Image
            style={[
              tw`bottom-4 h-[${
                (Dimensions.get('screen').width * 408) / 375
              }px] w-[${Dimensions.get('screen').width}px] overflow-hidden`,
            ]}
            resizeMode="cover"
            source={bundledSource(heroImage[0].url, env.useBundledContent)}
            accessibilityIgnoresInvertColors
          />
        </View>
      )}
    </View>
  );
}
