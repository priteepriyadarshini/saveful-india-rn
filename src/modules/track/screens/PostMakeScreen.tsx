import { Feather } from '@expo/vector-icons';
import { useLinkTo, useNavigation } from '@react-navigation/native';
import { skipToken } from '@reduxjs/toolkit/query';
import FocusAwareStatusBar from '../../../common/components/FocusAwareStatusBar';
import useContent from '../../../common/hooks/useContent';
import tw from '../../../common/tailwind';
import { IFramework } from '../../../models/craft';
import { mixpanelEventName } from '../../../modules/analytics/analytics';
import useAnalytics from '../../../modules/analytics/hooks/useAnalytics';
import { useCurentRoute } from '../../../modules/route/context/CurrentRouteContext';
import {
  useGetFeedbacksForFrameworkQuery,
  useGetUserMealQuery,
} from '../../../modules/track/api/api';
import { FeedbackResult } from '../../../modules/track/api/types';
import TrackPostMakeCarousel from '../../../modules/track/components/TrackPostMakeCarousel';
import { ITrackPostMakeIngredient } from '../../../modules/track/components/TrackPostMakeIngredients';
import TrackResult from '../../../modules/track/components/TrackResult';
import { POSTMAKE } from '../../../modules/track/data/data';
import { SurveyStackScreenProps } from '../../../modules/track/navigation/SurveyNavigator';
import React, { useEffect, useState } from 'react';
import { ImageBackground, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { h5TextStyle } from '../../../theme/typography';
import { RootNavigationStackParams } from '../../navigation/navigator/root/RootNavigator';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList } from '../../navigation/navigator/root/types';

export default function PostMakeScreen({
  route: {
    params: { id },
  },
}: SurveyStackScreenProps<'PostMake'>) {
  //const linkTo = useLinkTo();
  type RootTabNavigation = BottomTabNavigationProp<RootStackParamList>;
  const navigation = useNavigation<RootTabNavigation>();

  const {
    data: meal,
    isLoading: isGetUserMealLoading,
    isError: isGetUserMealError,
  } = useGetUserMealQuery({
    id,
  });

  const { getFramework } = useContent();
  const [framework, setFramework] = React.useState<IFramework>();

  const getFrameworksData = async (frameworkId: string) => {
    const data = await getFramework(frameworkId);

    if (data) {
      setFramework(data);
    }
  };

  // Fetch feedbacks for framework to check if the survey has been completed
  const { data: feedbacks, isLoading: isGetFeedbacksForFrameworkLoading } =
    useGetFeedbacksForFrameworkQuery(
      framework?.id ? { id: framework.id } : skipToken,
    );
  const feedbackForMeal = feedbacks?.find(
    feedback => feedback.data.meal_id === id,
  );

  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isIngredient, setIsIngredient] = useState<boolean>(false);
  const [selectedIngredients, setSelectedIngredients] = useState<
    ITrackPostMakeIngredient[]
  >([]);

  const { sendAnalyticsEvent, sendTimeEventAnalytics } = useAnalytics();
  const { newCurrentRoute } = useCurentRoute();

  // Total weight of selected ingredients
  const totalWeightOfSelectedIngredients = selectedIngredients.reduce(
    (acc, ingredient) => acc + ingredient.averageWeight,
    0,
  );

  const [feedback, setFeedback] = useState<FeedbackResult | undefined>();

  useEffect(() => {
    if (meal && meal.framework_id) {
      getFrameworksData(meal?.framework_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meal]);

  useEffect(() => {
    // TODO: Show already completed message
    // If the survey has been completed, navigate to feed
    if (feedbackForMeal && !isStarted) {
  if (feedbackForMeal.prompted) {
    // Navigate to Feed tab + FeedHome screen inside FeedStack
    navigation.navigate('Feed', 
      { 
        screen: 'FeedHome' 
      });
  } else {
    setFeedback(feedbackForMeal);
  }
}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedbackForMeal, isStarted]);

  if (
    !framework ||
    isGetUserMealLoading ||
    isGetFeedbacksForFrameworkLoading ||
    (feedbackForMeal && feedbackForMeal.prompted && !isStarted)
  ) {
    return null;
  }

  if (isGetUserMealError) {
    return (
      <View style={tw`flex-1 bg-eggplant`}>
        <ImageBackground
          style={tw`pb-20`}
          imageStyle={tw.style('rounded-2xl')}
          source={require('../../../../assets/placeholder/purple-line.png')}
        >
          <SafeAreaView edges={['bottom', 'top']} style={tw`pb-10`}>
            <View style={tw.style('items-end pr-3 pt-4')}>
              <Pressable
                onPress={() => {
                  navigation.goBack();
                }}
              >
                <Feather name={'x'} size={20} color="white" />
              </Pressable>
            </View>

            <Text
              style={tw.style(
                h5TextStyle,
                'p-10 text-center text-center text-white',
              )}
            >
              Something went wrong. Please try again later
            </Text>
          </SafeAreaView>
        </ImageBackground>
      </View>
    );
  }

  sendTimeEventAnalytics(mixpanelEventName.postMakeScreenView);

  return (
    <View style={tw`flex-1 bg-eggplant`}>
      <ImageBackground
        style={tw`pb-20`}
        imageStyle={tw.style('rounded-2xl')}
        source={require('../../../../assets/placeholder/purple-line.png')}
      >
        <SafeAreaView edges={['bottom', 'top']} style={tw`pb-10`}>
          <View style={tw.style('z-10 items-end')}>
            <Pressable
              onPress={() => {
                const props = {
                  location: newCurrentRoute,
                  action: mixpanelEventName.postMakeSurveyExit,
                  meal_id: framework?.id,
                  meal_name: framework?.title,
                };

                sendAnalyticsEvent({
                  event: mixpanelEventName.postMakeScreenView,
                  properties: props,
                });
                sendAnalyticsEvent({
                  event: mixpanelEventName.actionClicked,
                  properties: props,
                });
                navigation.goBack();
              }}
              style={tw`px-3 pt-4`}
            >
              <Feather name={'x'} size={20} color="white" />
            </Pressable>
          </View>

          {!isCompleted && (
            <TrackPostMakeCarousel
              framework={framework}
              mealId={id}
              data={POSTMAKE(framework.title) as any}
              handlePresentModalDismiss={() => {
                const props = {
                  location: newCurrentRoute,
                  action: mixpanelEventName.postMakeSurveyCompleted,
                  meal_id: framework?.id,
                  meal_name: framework?.title,
                };
                sendAnalyticsEvent({
                  event: mixpanelEventName.postMakeScreenView,
                  properties: props,
                });
                sendAnalyticsEvent({
                  event: mixpanelEventName.actionClicked,
                  properties: props,
                });
                navigation.goBack();
              }}
              usedIngredients={meal?.data?.ingredients.flatMap(i => i)}
              selectedIngredients={selectedIngredients}
              setSelectedIngredients={setSelectedIngredients}
              setIsIngredient={(value: boolean) => {
                setIsIngredient(value);
              }}
              feedback={feedback}
              isStarted={isStarted}
              setIsStarted={setIsStarted}
              setIsCompleted={(value: boolean) => {
                setIsCompleted(value);
              }}
              totalWeightOfSelectedIngredients={
                totalWeightOfSelectedIngredients
              }
              isIngredient={isIngredient}
            />
          )}

          {isCompleted && selectedIngredients.length > 0 && (
            <TrackResult
              foodSaved={totalWeightOfSelectedIngredients}
              handlePresentModalDismiss={() => {
                navigation.goBack();
              }}
              setIsCompleted={(value: boolean) => {
                setIsCompleted(value);
              }}
            />
          )}
        </SafeAreaView>
      </ImageBackground>

      <FocusAwareStatusBar statusBarStyle="light" />
    </View>
  );
}
