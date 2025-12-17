import React from 'react';
import { Dimensions, Image, ImageBackground, Text, View } from 'react-native';
import tw from '../../../common/tailwind';
import { 
  h6TextStyle, 
  bodyMediumRegular, 
  subheadSmallUppercase 
} from '../../../theme/typography';


export default function Staples() {
  return (
    <ImageBackground
      style={tw`items-center px-5 py-10`}
      source={require('../../../../assets/ribbons/lemon-2.png')}
    >
      <Text style={tw.style(h6TextStyle, 'mb-5 text-center')}>
        Pantry staples
      </Text>
      <View style={tw`rounded-2lg border border-kale bg-mint px-5 py-6`}>
        <Image
          style={tw`h-[${
            ((Dimensions.get('screen').width - 80) * 152) / 292
          }px] w-[${
            Dimensions.get('screen').width - 80
          }px] overflow-hidden rounded-2lg`}
          resizeMode="cover"
          source={require('../../../../assets/placeholder/staples.png')}
          accessibilityIgnoresInvertColors
        />

        <View style={tw`mb-6 mt-3 gap-3`}>
          <Text style={tw.style(h6TextStyle, 'text-center')}>Mayonnaise</Text>
          <Text style={tw.style(bodyMediumRegular, 'text-center text-midgray')}>
            Add a creamy twist to pastas, wraps and dips with mayo.{' '}
          </Text>
        </View>

        <View style={tw`flex-row items-center justify-center gap-1`}>
          <Text style={tw.style(subheadSmallUppercase)}>sponsored by</Text>
          <Image
            style={tw`h-[32px] w-[58px] overflow-hidden`}
            resizeMode="cover"
            source={require('../../../../assets/brands/praise.png')}
            accessibilityIgnoresInvertColors
          />
        </View>
      </View>
    </ImageBackground>
  );
}
