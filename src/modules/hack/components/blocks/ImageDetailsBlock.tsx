import { Image, Text, View } from 'react-native';
import tw from '../../../../common/tailwind';
import { subheadSmall, bodyMediumRegular } from '../../../../theme/typography';

interface ImageDetailsBlockProps {
  type: string;
  blockImageUrl: string;
  blockTitle: string;
  blockDescription: string;
  id: string;
  order?: number;
}

export default function ImageDetailsBlock({
  block,
}: {
  block: ImageDetailsBlockProps;
}) {
  if (!block.blockImageUrl) {
    return null;
  }

  return (
    <View style={tw.style('mx-5 items-center')}>
      <Image
        resizeMode="cover"
        style={tw.style(`h-[163px] w-[200px]`)}
        source={{ uri: block.blockImageUrl }}
        accessibilityIgnoresInvertColors
      />
      <Text style={tw.style(subheadSmall, 'mt-2.5 text-center')}>
        {block.blockTitle}
      </Text>
      <Text
        style={tw.style(bodyMediumRegular, 'mt-1 text-center text-midgray')}
      >
        {block.blockDescription}
      </Text>
    </View>
  );
}
