import { Dimensions, Image } from 'react-native';
import { bundledSource } from '../../../../common/helpers/uriHelpers';
import tw from '../../../../common/tailwind';
import { IArticleBlockImage } from '../../../../models/craft';
import useEnvironment from '../../../environment/hooks/useEnvironment';

export default function ImageBlock({ block }: { block: IArticleBlockImage }) {
  const env = useEnvironment();

  return (
    <Image
      resizeMode="contain"
      style={tw.style(
        `mx-5 w-[${Dimensions.get('window').width - 40}px] h-[${
          ((Dimensions.get('screen').width - 40) * 245) / 335
        }px]`,
      )}
      source={bundledSource(block.image[0].url, env.useBundledContent)}
      accessibilityIgnoresInvertColors
    />
  );
}
