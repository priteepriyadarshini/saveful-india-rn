import RenderHTML, { defaultSystemFonts } from 'react-native-render-html';
import frameworkDeepLink from '../../../../common/helpers/frameworkDeepLink';
import tw from '../../../../common/tailwind';
import { IArticleBlockText } from '../../../../models/craft';
import { tagStyles } from '../../../../theme/typography';


export default function TextBlock({ block }: { block: IArticleBlockText }) {
  const systemFonts = [
    ...defaultSystemFonts,
    'Saveful-Regular',
    'Saveful-Bold',
  ];

  if (block.text && block.text.includes('cms.dev.saveful.com/framework')) {
    console.log(frameworkDeepLink(block.text || ''));
  }

  return (
    <RenderHTML
      source={{
        html: frameworkDeepLink(block.text || ''),
      }}
      systemFonts={systemFonts}
      contentWidth={225}
      tagsStyles={{
        ...tagStyles,
        b: tw.style('font-sans-bold text-black'),
      }}
      defaultViewProps={{
        style: tw`m-0 shrink p-0`,
      }}
      defaultTextProps={{
        style: tw.style('mb-2 shrink px-5 text-midgray'),
      }}
    />
  );
}
