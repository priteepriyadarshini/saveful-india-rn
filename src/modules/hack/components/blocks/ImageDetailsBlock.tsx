import { useState } from 'react';
import { Image, Text, View } from 'react-native';
import { bundledSource } from '../../../../common/helpers/uriHelpers';
import tw from '../../../../common/tailwind';
import { IArticleBlockImageDetails } from '../../../../models/craft';
import { subheadSmall, bodyMediumRegular } from '../../../../theme/typography';
import useEnvironment from '../../../environment/hooks/useEnvironment';


export default function ImageDetailsBlock({
  block,
}: {
  block: IArticleBlockImageDetails;
}) {
  const [imageDetail] = useState<IArticleBlockImageDetails>(block);

  const env = useEnvironment();

  if (!imageDetail) {
    return null;
  }

  return (
    <View style={tw.style('mx-5 items-center')}>
      {imageDetail.blockImage.length > 0 && (
        <Image
          resizeMode="cover"
          style={tw.style(`h-[163px] w-[200px]`)}
          source={bundledSource(
            imageDetail.blockImage[0].url,
            env.useBundledContent,
          )}
          accessibilityIgnoresInvertColors
        />
      )}
      <Text style={tw.style(subheadSmall, 'mt-2.5 text-center')}>
        {imageDetail.blockTitle}
      </Text>
      <Text
        style={tw.style(bodyMediumRegular, 'mt-1 text-center text-midgray')}
      >
        {imageDetail.blockDescription}
      </Text>
    </View>
  );
}
