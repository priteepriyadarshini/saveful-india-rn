import { Text, View } from 'react-native';
import RenderHTML from 'react-native-render-html';
import frameworkDeepLink from '../../../../common/helpers/frameworkDeepLink';
import tw from '../../../../common/tailwind';
import { IArticleBlockList } from '../../../../models/craft';
import { cardDrop } from '../../../../theme/shadow';
import { 
  h7TextStyle, 
  h5TextStyle, 
  tagStyles, 
  bodyMediumRegular 
} from '../../../../theme/typography';


export default function ListBlock({ block }: { block: IArticleBlockList }) {
  return (
    <View
      style={tw.style(
        'mx-5 rounded-[10px] border border-strokecream bg-white p-6',
        cardDrop,
      )}
    >
      <View style={tw.style('border-b border-strokecream text-center')}>
        <Text style={tw.style(h7TextStyle, 'mb-4 text-center')}>
          {block.listTitle}
        </Text>
      </View>
      <View style={tw`py-4`}>
        {block.listItems.map((item: any, index: number) => {
          return (
            <View style={tw.style('mt-4 flex-row')} key={index}>
              <Text style={tw.style(h5TextStyle, 'pr-3.5 text-eggplant')}>
                {index + 1}.
              </Text>
              <RenderHTML
                source={{
                  html: frameworkDeepLink(item.listText || ''),
                }}
                contentWidth={225}
                tagsStyles={tagStyles}
                defaultViewProps={{
                  style: tw`m-0 shrink p-0`,
                }}
                defaultTextProps={{
                  style: tw.style(bodyMediumRegular, 'shrink text-midgray'),
                }}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}
