import { Dimensions, Image } from 'react-native';
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
    <Image
      resizeMode="contain"
      style={tw.style(
        `mx-5 w-[${Dimensions.get('window').width - 40}px] h-[${
          ((Dimensions.get('screen').width - 40) * 245) / 335
        }px]`,
      )}
      source={{ uri: block.imageUrl }}
      accessibilityIgnoresInvertColors
    />
  );
}
