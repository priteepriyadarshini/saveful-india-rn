import { View } from 'react-native';
import tw from '../../../../common/tailwind';
import { IArticleBlockHackOrTip } from '../../../../models/craft';
import HackOrTip from '../../../make/components/HackOrTip';

export default function HackOrTipBlock({
  block,
}: {
  block: IArticleBlockHackOrTip;
}) {
  return (
    <View style={tw`mx-5`}>
      <HackOrTip id={block.hackOrTip[0].id} block={true} />
    </View>
  );
}
