import tw from '../../../common/tailwind';
import { Text, View } from 'react-native';
import { h6TextStyle, subheadSmallUppercase } from '../../../theme/typography';

export default function TrackFeed() {
  return (
    <View
      style={tw.style(
        `py-4.5 mt-5 rounded-2lg border border-eggplant-light bg-white px-5 shadow-sm`,
      )}
    >
      <View style={tw`flex-row items-center justify-between gap-3`}>
        <View style={tw`grow items-center gap-1`}>
          <Text style={tw.style(h6TextStyle, 'text-black')}>2.1kg</Text>
          <Text
            style={[
              tw.style(subheadSmallUppercase, 'text-center text-stone'),
              { letterSpacing: 1 },
            ]}
          >
            food saved
          </Text>
        </View>
        <View style={tw`h-full w-[1px] bg-strokecream`} />
        <View style={tw`grow items-center gap-1`}>
          <Text style={tw.style(h6TextStyle, 'text-black')}>$18.95</Text>
          <Text
            style={[
              tw.style(subheadSmallUppercase, 'text-center text-stone'),
              { letterSpacing: 1 },
            ]}
          >
            saved
          </Text>
        </View>
        <View style={tw`h-full w-[1px] bg-strokecream`} />
        <View style={tw`grow items-center gap-1`}>
          <Text style={tw.style(h6TextStyle, 'text-black')}>15.9kg</Text>
          <Text
            style={[
              tw.style(subheadSmallUppercase, 'text-center text-stone'),
              { letterSpacing: 1 },
            ]}
          >
            co2 saved
          </Text>
        </View>
      </View>
    </View>
  );
}
