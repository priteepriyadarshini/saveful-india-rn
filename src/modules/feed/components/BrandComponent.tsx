import tw from '../../../common/tailwind';
import { Image, Text, View } from 'react-native';
import { subheadSmallUppercase } from '../../../theme/typography';

export default function BrandComponent({ brand }: { brand: any }) {
  return (
    <View style={tw.style('w-full items-center')}>
      {brand &&
        brand?.map((brand: any) => {
          return (
            <View
              key={brand.id}
              style={tw.style(
                'w-full items-center border-t border-strokecream pt-5',
              )}
            >
              <Image
                resizeMode="contain"
                source={brand.image}
                accessibilityIgnoresInvertColors
              />
              <Text
                style={[
                  tw.style(
                    subheadSmallUppercase,
                    'my-5 text-center text-stone',
                  ),
                  { letterSpacing: 1 },
                ]}
              >
                {brand.name}
              </Text>
            </View>
          );
        })}
    </View>
  );
}
