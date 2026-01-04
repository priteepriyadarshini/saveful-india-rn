import { Dimensions, Image } from 'react-native';
import { bundledSource } from '../../../../common/helpers/uriHelpers';
import tw from '../../../../common/tailwind';
import { IArticleBlockImage } from '../../../../models/craft';
import useEnvironment from '../../../environment/hooks/useEnvironment';

// Extended type to handle both Craft CMS and API formats
type ImageBlockProps = IArticleBlockImage | {
  type?: string;
  imageUrl: string;
  caption?: string;
};

export default function ImageBlock({ block }: { block: ImageBlockProps }) {
  const env = useEnvironment();

  // Determine image source - API uses imageUrl string, Craft uses image array
  const imageSource = 'imageUrl' in block && typeof block.imageUrl === 'string'
    ? { uri: block.imageUrl }
    : bundledSource((block as IArticleBlockImage).image[0].url, env.useBundledContent);

  return (
    <Image
      resizeMode="contain"
      style={tw.style(
        `mx-5 w-[${Dimensions.get('window').width - 40}px] h-[${
          ((Dimensions.get('screen').width - 40) * 245) / 335
        }px]`,
      )}
      source={imageSource}
      accessibilityIgnoresInvertColors
    />
  );
}
