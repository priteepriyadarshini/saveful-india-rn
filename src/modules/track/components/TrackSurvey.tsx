import tw from '../../../common/tailwind';
import ClearOutComponent from '../../../modules/track/components/WeeklySurvey/ClearOutComponent';
import TrackSurveyProduceComponent from '../../../modules/track/components/WeeklySurvey/TrackSurveyProduceComponent';
import TrackSurveyProduceSelectionComponent from '../../../modules/track/components/WeeklySurvey/TrackSurveyProduceSelectionComponent';
import WeeklyIngredientsList from '../../../modules/track/components/WeeklySurvey/WeeklyIngredientsList';
import WeeklySurveyQ1 from '../../../modules/track/components/WeeklySurvey/WeeklySurveyQ1';
import WeeklySurveyQ2 from '../../../modules/track/components/WeeklySurvey/WeeklySurveyQ2';
import { ISurveyList, Survey } from '../../../modules/track/types';
import React from 'react';
import { Text, View } from 'react-native';

export default function TrackSurvey({
  item,
  data,
  scrollToItem,
  selectedProduce,
  setSelectedProduce,
  activeDotIndex,
  control,
  onSurveyComplete,
}: {
  item: ISurveyList;
  data: Survey;
  scrollToItem: (index: number) => void;

  selectedProduce: string[];
  setSelectedProduce: (produce: string | undefined) => void;
  activeDotIndex: number;
  control: any;
  onSurveyComplete: (
    e?: React.BaseSyntheticEvent<object, any, any> | undefined,
  ) => Promise<void>;
}) {
  const renderContent = (value: number, item: ISurveyList) => {
    switch (value) {
      case 0:
        return (
          <WeeklySurveyQ1
            item={item}
            control={control}
            activeDotIndex={activeDotIndex}
            scrollToItem={scrollToItem}
          />
        );
      case 1:
        return (
          <WeeklySurveyQ2
            item={item}
            control={control}
            activeDotIndex={activeDotIndex}
            scrollToItem={scrollToItem}
          />
        );
      case 2:
        return (
          <WeeklySurveyQ2
            item={item}
            control={control}
            activeDotIndex={activeDotIndex}
            scrollToItem={scrollToItem}
          />
        );
      case 3:
        return (
          <ClearOutComponent
            item={item}
            activeDotIndex={activeDotIndex}
            scrollToItem={scrollToItem}
          />
        );
      case 4:
        return (
          <TrackSurveyProduceComponent
            item={item}
            activeDotIndex={activeDotIndex}
            scrollToItem={scrollToItem}
            selectedProduce={selectedProduce}
            setSelectedProduce={setSelectedProduce}
          />
        );
      case 5:
        return (
          <TrackSurveyProduceSelectionComponent
            item={item}
            activeDotIndex={activeDotIndex}
            scrollToItem={scrollToItem}
            selectedProduce={selectedProduce}
            control={control}
            data={data}
          />
        );
      case 6:
        return (
          <WeeklyIngredientsList
            name="preferredIngredients"
            control={control}
            item={item}
            onSurveyComplete={onSurveyComplete}
          />
        );
      default:
        return <Text>No Content Available</Text>;
    }
  };

  return (
    <View style={tw.style('items-center')}>
      <>{renderContent(item?.id as number, item)}</>
    </View>
  );
}
