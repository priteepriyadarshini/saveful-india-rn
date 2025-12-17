import PrimaryButton from '../../../../common/components/ThemeButtons/PrimaryButton';
import tw from '../../../../common/tailwind';
import TrackLinearGradient from '../../../../modules/track/components/TrackLinearGradient';
import { ISurveyList } from '../../../../modules/track/types';
import { Image, ScrollView, Text, View } from 'react-native';
import { bodyMediumRegular, h5TextStyle } from '../../../../theme/typography';

export default function ClearOutComponent({
  item,
  activeDotIndex,
  scrollToItem,
}: {
  item: ISurveyList;
  activeDotIndex: number;
  scrollToItem: (index: number) => void;
}) {
  return (
    <View style={tw.style('justify-between px-10')}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw.style(`w-full pb-5`)}
      >
        <View>
          <View style={tw.style('items-center pt-8')}>
            <Image
              style={tw`mx-auto w-[296px] max-w-full`}
              resizeMode="contain"
              source={item.image?.uri as any}
              accessibilityIgnoresInvertColors
            />
            <Text
              style={tw.style(h5TextStyle, 'pb-2 pt-16 text-center text-white')}
              maxFontSizeMultiplier={1}
            >
              {item.title}
            </Text>
            <Text
              style={tw.style(bodyMediumRegular, 'pb-2 text-center text-white')}
            >
              {item.subTitle}
            </Text>
          </View>
        </View>
      </ScrollView>
      <View>
        <TrackLinearGradient style={'top-[-33px]'} />
        <PrimaryButton
          style={tw.style('mb-2')}
          onPress={() => {
            scrollToItem(activeDotIndex + 1);
          }}
        >
          Let’s go
        </PrimaryButton>
      </View>
    </View>
  );
}
