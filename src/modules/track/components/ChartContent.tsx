import tw from '../../../common/tailwind';
import { Image, Text, View } from 'react-native';
import { subheadMediumUppercase, h2TextStyle } from '../../../theme/typography';

export default function ChartContent({
  item,
}: {
  item: {
    heading: string;
    value: string;
    image: {
      uri: string;
    };
    description: string;
  };
}) {
  const tabStyle = 'pt-3 items-center w-full';
  return (
    <View style={tw.style(tabStyle, 'px-5 pb-6')}>
      <Image
        style={tw.style('mx-auto h-[190px] w-[154px] w-full')}
        resizeMode="contain"
        source={item.image.uri as any}
        accessibilityIgnoresInvertColors
      />
      <Text
        style={[
          tw.style(subheadMediumUppercase, 'mt-5 text-stone'),
          { letterSpacing: 1 },
        ]}
      >
        {item.heading}
      </Text>
      <Text style={tw.style(h2TextStyle, 'mt-1')}>{item.value}</Text>
      <Text
        style={tw.style(subheadMediumUppercase, 'mt-1 text-center text-stone')}
      >
        {item.description}
      </Text>
    </View>
  );
}
