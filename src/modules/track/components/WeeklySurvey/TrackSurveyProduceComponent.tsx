import PrimaryButton from '../../../../common/components/ThemeButtons/PrimaryButton';
import tw from '../../../../common/tailwind';
import TrackLinearGradient from '../../../../modules/track/components/TrackLinearGradient';
import TrackSurveyProduce from '../../../../modules/track/components/TrackSurveyProduce';
import { IProduceList, ISurveyList } from '../../../../modules/track/types';
import { ScrollView, Text, View } from 'react-native';
import { bodyMediumRegular, h6TextStyle } from '../../../../theme/typography';

export default function TrackSurveyProduceComponent({
  item,
  activeDotIndex,
  scrollToItem,
  selectedProduce,
  setSelectedProduce,
}: {
  item: ISurveyList;
  activeDotIndex: number;
  selectedProduce: string[];
  setSelectedProduce: (produce: string | undefined) => void;
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
            <Text
              style={tw.style(h6TextStyle, 'pb-2 text-center text-white')}
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
        <View style={tw.style('w-full')}>
          <TrackSurveyProduce
            list={item.produces as IProduceList[]}
            selectedProduce={selectedProduce}
            setSelectedProduce={setSelectedProduce}
          />
        </View>
      </ScrollView>
      <View>
        <TrackLinearGradient style={'top-[-33px]'} />
        <PrimaryButton
          style={tw.style('mb-2')}
          onPress={() => {
            if (selectedProduce.length > 0) {
              scrollToItem(activeDotIndex + 1);
            } else {
              scrollToItem(activeDotIndex + 2);
            }
          }}
        >
          Next
        </PrimaryButton>
      </View>
    </View>
  );
}
