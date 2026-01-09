import { Dimensions, Image, View } from 'react-native';
import tw from '../../../../common/tailwind';

interface ImageBlockProps {
  type: string;
  imageUrl: string;
  caption?: string;
  id: string;
  order?: number;
}

export default function ImageBlock({ block }: { block: ImageBlockProps }) {
  return (
    <View style={tw.style('mx-5 overflow-hidden rounded-[28px]')}>
      <Image
        resizeMode="contain"
        style={tw.style(
          `w-[${Dimensions.get('window').width - 20}px] h-[${
            ((Dimensions.get('screen').width - 40) * 245) / 335
          }px]`,
        )}
        source={{ uri: block.imageUrl }}
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}
