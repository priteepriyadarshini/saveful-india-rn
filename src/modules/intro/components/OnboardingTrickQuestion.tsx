import tw from '../../../common/tailwind';
import { Image, Text, View } from 'react-native';
import { cardDrop } from '../../../theme/shadow';
import {
  bodyLargeRegular,
  h6TextStyle,
  subheadMediumUppercase,
} from '../../../theme/typography';

const options = [
  {
    id: 0,
    name: 'scraps',
    image: {
      uri: require('../../../../assets/placeholder/scraps.png'),
    },
  },
  {
    id: 1,
    name: 'fresh produce',
    image: {
      uri: require('../../../../assets/placeholder/produce.png'),
    },
  },
  {
    id: 2,
    name: 'leftovers',
    image: {
      uri: require('../../../../assets/placeholder/leftovers.png'),
    },
  },
];

export default function OnboardingTrickQuestion() {
  return (
    <View
      style={[
        tw.style('rounded-[10px] border border-strokecream bg-white py-[30px]'),
        cardDrop,
      ]}
    >
      <Text style={tw.style(h6TextStyle, 'mx-3 text-center')}>
        let’s start saving
      </Text>
      <Text
        style={tw.style(bodyLargeRegular, 'mx-3 mt-3 text-center')}
      >{`In a week’s time, we’ll check in to see how much food and money you’re potentially saving.\n\nSo, keep an eye on your: `}</Text>
      <View style={tw.style('w-full flex-row justify-between px-3')}>
        {options.map(option => {
          return (
            <View key={option.id} style={tw`max-w-[102px]`}>
              <Image
                style={[tw`mx-auto my-3 h-[108px] overflow-hidden`]}
                resizeMode="contain"
                source={option.image.uri}
                accessibilityIgnoresInvertColors
              />
              <Text
                style={tw.style(subheadMediumUppercase, 'text-center')}
                maxFontSizeMultiplier={1.5}
              >
                {option.name}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
