import tw from '../../../common/tailwind';
import { Image, Text, View } from 'react-native';
import { h5TextStyle } from '../../../theme/typography';

export default function CircularHeader({ title }: { title: string }) {
  return (
    <View style={tw.style('relative')}>
      <View
        style={tw.style(
          'absolute bottom-0 left-0 right-0 top-0 items-center justify-center',
        )}
      >
        <Image
          resizeMode="cover"
          source={require('../../../../assets/Illustration/Illustration.png')}
          accessibilityIgnoresInvertColors
        />
      </View>
      <Text
        style={tw.style('z-10 py-4 text-center', h5TextStyle)}
        maxFontSizeMultiplier={1}
      >
        {title}
      </Text>
    </View>
  );
}
