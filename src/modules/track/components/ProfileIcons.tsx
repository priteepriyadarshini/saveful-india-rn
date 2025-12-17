import tw from '../../../common/tailwind';
import { Text, View } from 'react-native';
import { h7TextStyle } from '../../../theme/typography';


export default function ProfileIcons({ iconText }: { iconText?: string }) {
  return (
    <View
      style={tw.style(
        'h-[38px] w-[38px] items-center justify-center rounded-[38px] bg-mint',
      )}
    >
      <Text style={tw.style(h7TextStyle)}>{`${iconText ?? 'S'}`}</Text>
    </View>
  );
}
