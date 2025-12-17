import PrimaryButton from '../../../../common/components/ThemeButtons/PrimaryButton';
import tw from '../../../../common/tailwind';
import SurveyCounter from '../../../../modules/track/components/SurveyCounter';
import TrackLinearGradient from '../../../../modules/track/components/TrackLinearGradient';
import { ISurveyList } from '../../../../modules/track/types';
import { Image, ScrollView, Text, View } from 'react-native';
import { bodyMediumRegular, h5TextStyle } from '../../../../theme/typography';

export default function WeeklySurveyQ1({
  item,
  control,
  activeDotIndex,
  scrollToItem,
}: {
  item: ISurveyList;
  control: any;
  activeDotIndex: number;
  scrollToItem: (index: number) => void;
}) {
  return (
    <View style={tw.style('justify-between')}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw.style(`w-full pb-5`)}
      >
        <View style={tw.style(`px-11`)}>
          <View style={tw.style('items-center pt-8')}>
            <Text
              style={tw.style(h5TextStyle, 'pb-2 text-center text-white')}
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
        <View style={tw.style('left-5 -mt-4 w-full')}>
          <Image
            style={tw`mx-auto w-[354px] max-w-full`}
            resizeMode="contain"
            source={item.image?.uri as any}
            accessibilityIgnoresInvertColors
          />
        </View>
        <View style={tw.style('-mt-10 px-11')}>
          <SurveyCounter
            name={item.name}
            phrase={item.phrase}
            control={control}
          />
        </View>
      </ScrollView>
      <View style={tw.style('w-full items-center px-11')}>
        <View>
          <TrackLinearGradient style="w-full" />
        </View>
      </View>
      <View style={tw.style('px-11')}>
        <PrimaryButton
          style={tw.style('mb-2')}
          onPress={() => {
            scrollToItem(activeDotIndex + 1);
          }}
        >
          Next
        </PrimaryButton>
      </View>
    </View>
  );
}
