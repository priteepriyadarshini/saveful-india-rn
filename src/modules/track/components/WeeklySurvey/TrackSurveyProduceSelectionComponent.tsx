import PrimaryButton from '../../../../common/components/ThemeButtons/PrimaryButton';
import tw from '../../../../common/tailwind';
import SurveyCounter from '../../../../modules/track/components/SurveyCounter';
import TrackLinearGradient from '../../../../modules/track/components/TrackLinearGradient';
import { ISurveyList, Survey } from '../../../../modules/track/types';
import { ScrollView, Text, View } from 'react-native';
import { bodyMediumRegular, h6TextStyle } from '../../../../theme/typography';

export default function TrackSurveyProduceSelectionComponent({
  item,
  activeDotIndex,
  scrollToItem,
  selectedProduce,
  control,
  data,
}: {
  item: ISurveyList;
  activeDotIndex: number;
  control: any;
  data: Survey;
  selectedProduce: string[];
  scrollToItem: (index: number) => void;
}) {
  return (
    <View>
      <ScrollView contentContainerStyle={tw.style('px-6')}>
        <View>
          <View style={tw.style('items-center pt-8')}>
            <Text style={tw.style(h6TextStyle, 'pb-2 text-center text-white')}>
              {item.title}
            </Text>
            <Text
              style={tw.style(bodyMediumRegular, 'pb-2 text-center text-white')}
            >
              {item.subTitle}
            </Text>
          </View>
        </View>
        {selectedProduce.length > 0 ? (
          <View style={tw.style('w-full')}>
            {selectedProduce.map((produce: string) => {
              const produceItem =
                data?.surveyList &&
                data?.surveyList[4].produces?.filter(
                  list =>
                    list.name?.toLowerCase().includes(produce.toLowerCase()),
                );
              if (!produceItem) return null;
              return (
                <View
                  style={tw.style('border-b border-eggplant-light py-4')}
                  key={produce}
                >
                  <SurveyCounter
                    title={produce}
                    name={produceItem[0].controllerName}
                    phrase={produceItem[0].phrase}
                    control={control}
                  />
                </View>
              );
            })}
          </View>
        ) : (
          <View style={tw.style('items-center justify-center py-6')}>
            <Text style={tw.style(h6TextStyle, 'pb-5 text-center text-white')}>
              No Produce is Selected
            </Text>
          </View>
        )}
      </ScrollView>
      <View>
        <TrackLinearGradient style={'top-[-33px]'} />
        <PrimaryButton
          style={tw.style('mx-5 mb-2')}
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
